import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for updating company
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  industry: z.string().optional(),
  lastFundingRound: z.string().optional(),
  lastFundingAmount: z.number().optional(),
  lastFundingDate: z.string().datetime().optional(),
  totalFunding: z.number().optional(),
  gtmGapDetected: z.boolean().optional(),
  executiveTurnover: z.boolean().optional(),
  analysisNotes: z.string().optional(),
});

// GET /api/companies/[id] - Get single company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        executives: {
          orderBy: { vulnerabilityScore: 'desc' },
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Calculate chaos indicators
    const chaosIndicators = {
      fundingPressure: false,
      gtmGap: company.gtmGapDetected,
      executiveTurnover: company.executiveTurnover,
      vulnerableExecutives: company.executives.filter(e => e.vulnerabilityScore >= 70).length,
      recentAlerts: company.alerts.filter(a => !a.isRead).length,
    };

    // Check funding pressure
    if (company.lastFundingDate) {
      const daysSinceFunding = Math.floor(
        (Date.now() - new Date(company.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      chaosIndicators.fundingPressure = daysSinceFunding <= 90;
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id] - Update company
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    // Get current company for pressure score calculation
    const currentCompany = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        executives: true,
      },
    });

    if (!currentCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Recalculate pressure score
    const updatedCompany = { ...currentCompany, ...validatedData };
    const pressureScore = calculatePressureScore(updatedCompany);

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        pressureScore,
      },
      include: {
        executives: true,
        alerts: true,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function (duplicate - should be extracted)
function calculatePressureScore(company: any): number {
  let score = 0;

  if (company.lastFundingDate) {
    const daysSinceFunding = Math.floor(
      (Date.now() - new Date(company.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceFunding <= 30) score += 30;
    else if (daysSinceFunding <= 60) score += 25;
    else if (daysSinceFunding <= 90) score += 20;
    else if (daysSinceFunding <= 180) score += 10;
  }

  if (company.lastFundingAmount) {
    if (company.lastFundingAmount >= 50000000) score += 20;
    else if (company.lastFundingAmount >= 20000000) score += 15;
    else if (company.lastFundingAmount >= 10000000) score += 10;
  }

  if (company.gtmGapDetected) score += 25;
  if (company.executiveTurnover) score += 20;

  if (company.executives) {
    const maxVulnerability = Math.max(...company.executives.map((e: any) => e.vulnerabilityScore || 0), 0);
    score += Math.floor(maxVulnerability * 0.05);
  }

  return Math.min(100, Math.max(0, score));
}