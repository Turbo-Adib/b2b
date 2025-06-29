import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating executive
const createExecutiveSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1),
  title: z.string().min(1),
  linkedinUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  riskFactors: z.array(z.string()).default([]),
  desperationSignals: z.array(z.string()).default([]),
  lastLinkedinPost: z.string().datetime().optional(),
  notes: z.string().optional(),
  opportunityType: z.string().optional(),
});

// GET /api/executives - List executives
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const vulnerability = searchParams.get('vulnerability'); // high, medium, low
    const title = searchParams.get('title'); // CEO, CMO, CRO filter

    // Build where clause
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    if (title) where.title = { contains: title, mode: 'insensitive' };

    const executives = await prisma.executive.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            lastFundingRound: true,
            lastFundingDate: true,
            gtmGapDetected: true,
          },
        },
      },
      orderBy: { vulnerabilityScore: 'desc' },
    });

    // Calculate vulnerability scores if not set
    const executivesWithScores = await Promise.all(
      executives.map(async (executive) => {
        let vulnerabilityScore = executive.vulnerabilityScore;
        
        if (vulnerabilityScore === 0) {
          vulnerabilityScore = calculateVulnerabilityScore(executive);
          await prisma.executive.update({
            where: { id: executive.id },
            data: { vulnerabilityScore },
          });
        }
        
        return { ...executive, vulnerabilityScore };
      })
    );

    // Filter by vulnerability level
    let filteredExecutives = executivesWithScores;
    if (vulnerability) {
      filteredExecutives = executivesWithScores.filter(exec => {
        if (vulnerability === 'high') return exec.vulnerabilityScore >= 70;
        if (vulnerability === 'medium') return exec.vulnerabilityScore >= 40 && exec.vulnerabilityScore < 70;
        if (vulnerability === 'low') return exec.vulnerabilityScore < 40;
        return true;
      });
    }

    // Group by title for summary
    const titleDistribution = filteredExecutives.reduce((acc: any, exec) => {
      const roleTitle = extractRoleTitle(exec.title);
      if (!acc[roleTitle]) acc[roleTitle] = 0;
      acc[roleTitle]++;
      return acc;
    }, {});

    // Calculate risk factor distribution
    const riskFactorCounts = filteredExecutives.reduce((acc: any, exec) => {
      exec.riskFactors.forEach(factor => {
        if (!acc[factor]) acc[factor] = 0;
        acc[factor]++;
      });
      return acc;
    }, {});

    return NextResponse.json({
      executives: filteredExecutives,
      stats: {
        total: filteredExecutives.length,
        highVulnerability: filteredExecutives.filter(e => e.vulnerabilityScore >= 70).length,
        withDesperationSignals: filteredExecutives.filter(e => e.desperationSignals.length > 0).length,
        titleDistribution,
        topRiskFactors: Object.entries(riskFactorCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error fetching executives:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/executives - Create executive
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createExecutiveSchema.parse(body);

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Calculate vulnerability score
    const vulnerabilityScore = calculateVulnerabilityScore({
      ...validatedData,
      company,
    });

    const executive = await prisma.executive.create({
      data: {
        ...validatedData,
        vulnerabilityScore,
      },
      include: {
        company: true,
      },
    });

    // Create alert if high vulnerability
    if (vulnerabilityScore >= 70) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'EXECUTIVE_VULNERABILITY',
          priority: 'HIGH',
          title: `Vulnerable executive: ${validatedData.name} at ${company.name}`,
          message: `${validatedData.title} showing high vulnerability (score: ${vulnerabilityScore}). Risk factors: ${validatedData.riskFactors.join(', ')}. ${
            validatedData.opportunityType ? `Opportunity: ${validatedData.opportunityType}` : ''
          }`,
          companyId: company.id,
          actionRequired: true,
        },
      });
    }

    // Update company pressure score
    const executives = await prisma.executive.findMany({
      where: { companyId: company.id },
    });
    
    const maxVulnerability = Math.max(...executives.map(e => e.vulnerabilityScore));
    const pressureScore = calculateCompanyPressureScore({
      ...company,
      executives,
    });

    await prisma.company.update({
      where: { id: company.id },
      data: { pressureScore },
    });

    return NextResponse.json({ executive });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating executive:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate vulnerability score
function calculateVulnerabilityScore(executive: any): number {
  let score = 0;

  // Title-based base vulnerability
  const title = executive.title.toUpperCase();
  if (title.includes('CMO')) score += 20; // High pressure role
  else if (title.includes('CRO')) score += 25; // Very high pressure role
  else if (title.includes('CEO') && executive.company?.lastFundingDate) score += 15;
  else if (title.includes('VP') && (title.includes('SALES') || title.includes('MARKETING'))) score += 15;

  // Risk factors scoring
  const riskFactorScores: any = {
    'pipeline_pressure': 15,
    'ad_spend_waste': 10,
    'board_pressure': 20,
    'no_gtm_team': 15,
    'founder_led_sales': 10,
    'recent_hire': 10,
    'public_criticism': 15,
  };

  executive.riskFactors?.forEach((factor: string) => {
    score += riskFactorScores[factor] || 5;
  });

  // Desperation signals
  score += (executive.desperationSignals?.length || 0) * 5;

  // Recent LinkedIn activity suggests pressure
  if (executive.lastLinkedinPost) {
    const daysSincePost = Math.floor(
      (Date.now() - new Date(executive.lastLinkedinPost).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePost <= 7) score += 5; // Very active posting
  }

  // Company factors
  if (executive.company) {
    if (executive.company.gtmGapDetected) score += 10;
    if (executive.company.lastFundingDate) {
      const daysSinceFunding = Math.floor(
        (Date.now() - new Date(executive.company.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceFunding <= 90) score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}

// Helper function to extract role title
function extractRoleTitle(title: string): string {
  const upperTitle = title.toUpperCase();
  if (upperTitle.includes('CEO')) return 'CEO';
  if (upperTitle.includes('CMO')) return 'CMO';
  if (upperTitle.includes('CRO')) return 'CRO';
  if (upperTitle.includes('CFO')) return 'CFO';
  if (upperTitle.includes('CTO')) return 'CTO';
  if (upperTitle.includes('COO')) return 'COO';
  if (upperTitle.includes('VP')) return 'VP';
  if (upperTitle.includes('DIRECTOR')) return 'Director';
  return 'Other';
}

// Helper function for company pressure score
function calculateCompanyPressureScore(company: any): number {
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