import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating company
const createCompanySchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  industry: z.string().min(1),
  lastFundingRound: z.string().optional(),
  lastFundingAmount: z.number().optional(),
  lastFundingDate: z.string().datetime().optional(),
  totalFunding: z.number().optional(),
  gtmGapDetected: z.boolean().default(false),
  executiveTurnover: z.boolean().default(false),
  analysisNotes: z.string().optional(),
});

// GET /api/companies - List companies
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pressureFilter = searchParams.get('pressure'); // high, medium, low
    const gtmGap = searchParams.get('gtmGap');
    const days = searchParams.get('days'); // funding in last N days
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (gtmGap === 'true') where.gtmGapDetected = true;
    
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      where.lastFundingDate = { gte: daysAgo };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        executives: {
          orderBy: { vulnerabilityScore: 'desc' },
        },
        alerts: {
          where: { isRead: false },
          select: {
            id: true,
            type: true,
            priority: true,
          },
        },
      },
      orderBy: { pressureScore: 'desc' },
    });

    // Calculate pressure scores if not set
    const companiesWithScores = await Promise.all(
      companies.map(async (company) => {
        let pressureScore = company.pressureScore;
        
        // Calculate pressure score based on various factors
        if (pressureScore === 0) {
          pressureScore = calculatePressureScore(company);
          await prisma.company.update({
            where: { id: company.id },
            data: { pressureScore },
          });
        }
        
        return { ...company, pressureScore };
      })
    );

    // Filter by pressure level after calculation
    let filteredCompanies = companiesWithScores;
    if (pressureFilter) {
      filteredCompanies = companiesWithScores.filter(company => {
        if (pressureFilter === 'high') return company.pressureScore >= 70;
        if (pressureFilter === 'medium') return company.pressureScore >= 40 && company.pressureScore < 70;
        if (pressureFilter === 'low') return company.pressureScore < 40;
        return true;
      });
    }

    // Calculate statistics
    const stats = {
      total: filteredCompanies.length,
      withRecentFunding: filteredCompanies.filter(c => {
        if (!c.lastFundingDate) return false;
        const daysSinceFunding = Math.floor((Date.now() - new Date(c.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceFunding <= 90;
      }).length,
      gtmGaps: filteredCompanies.filter(c => c.gtmGapDetected).length,
      executiveTurnover: filteredCompanies.filter(c => c.executiveTurnover).length,
      highPressure: filteredCompanies.filter(c => c.pressureScore >= 70).length,
      totalFunding: filteredCompanies.reduce((sum, c) => sum + (c.totalFunding || 0), 0),
    };

    return NextResponse.json({
      companies: filteredCompanies,
      stats,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies - Create company
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Calculate initial pressure score
    const pressureScore = calculatePressureScore({
      ...validatedData,
      executives: [],
      alerts: [],
    });

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        pressureScore,
      },
      include: {
        executives: true,
        alerts: true,
      },
    });

    // Create alert if high pressure detected
    if (pressureScore >= 70 && validatedData.lastFundingDate) {
      const daysSinceFunding = Math.floor(
        (Date.now() - new Date(validatedData.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'FUNDING_ROUND',
          priority: 'HIGH',
          title: `High pressure company: ${validatedData.name}`,
          message: `${validatedData.name} raised ${validatedData.lastFundingRound} ${daysSinceFunding} days ago. ${
            validatedData.gtmGapDetected ? 'GTM gap detected. ' : ''
          }${validatedData.executiveTurnover ? 'Executive turnover detected. ' : ''}Pressure score: ${pressureScore}`,
          companyId: company.id,
          actionRequired: true,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate pressure score
function calculatePressureScore(company: any): number {
  let score = 0;

  // Recent funding (within 90 days)
  if (company.lastFundingDate) {
    const daysSinceFunding = Math.floor(
      (Date.now() - new Date(company.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceFunding <= 30) score += 30;
    else if (daysSinceFunding <= 60) score += 25;
    else if (daysSinceFunding <= 90) score += 20;
    else if (daysSinceFunding <= 180) score += 10;
  }

  // Funding amount pressure
  if (company.lastFundingAmount) {
    if (company.lastFundingAmount >= 50000000) score += 20; // $50M+
    else if (company.lastFundingAmount >= 20000000) score += 15; // $20M+
    else if (company.lastFundingAmount >= 10000000) score += 10; // $10M+
  }

  // GTM gap is a major pressure indicator
  if (company.gtmGapDetected) score += 25;

  // Executive turnover indicates internal chaos
  if (company.executiveTurnover) score += 20;

  // Executive vulnerability adds to pressure
  if (company.executives) {
    const maxVulnerability = Math.max(...company.executives.map((e: any) => e.vulnerabilityScore || 0), 0);
    score += Math.floor(maxVulnerability * 0.05); // Up to 5 points from exec vulnerability
  }

  return Math.min(100, Math.max(0, score));
}