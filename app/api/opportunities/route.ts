import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating opportunities
const createOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  regulationType: z.string().min(1),
  regulationReference: z.string().optional(),
  implementationDate: z.string().datetime().optional(),
  deadlineDate: z.string().datetime().optional(),
  legislativeStage: z.string().optional(),
  targetIndustries: z.array(z.string()).default([]),
  affectedCountries: z.array(z.string()).default([]),
  estimatedMarketSize: z.number().optional(),
  complianceRequirements: z.string().optional(),
});

// GET /api/opportunities - List opportunities
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const where: any = { userId: session.userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        _count: {
          select: {
            competitors: true,
            notes: true,
            documents: true,
            researchTasks: {
              where: { status: 'PENDING' }
            }
          }
        }
      },
      orderBy: { [sortBy]: order }
    });

    // Calculate scores for opportunities
    const opportunitiesWithScores = opportunities.map(opp => {
      const score = calculateOpportunityScore(opp);
      return { ...opp, calculatedScore: score };
    });

    return NextResponse.json({ opportunities: opportunitiesWithScores });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/opportunities - Create opportunity
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOpportunitySchema.parse(body);

    // Calculate initial score and lead time
    const leadTimeMonths = validatedData.implementationDate
      ? Math.floor(
          (new Date(validatedData.implementationDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24 * 30)
        )
      : null;

    const opportunity = await prisma.opportunity.create({
      data: {
        ...validatedData,
        userId: session.userId,
        leadTimeMonths,
        opportunityScore: 0, // Will be calculated
      },
      include: {
        _count: {
          select: {
            competitors: true,
            notes: true,
            documents: true,
          }
        }
      }
    });

    // Calculate and update score
    const score = calculateOpportunityScore(opportunity);
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { opportunityScore: score },
    });

    return NextResponse.json({ opportunity: updatedOpportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate opportunity score
function calculateOpportunityScore(opportunity: any): number {
  let score = 50; // Base score

  // Revenue potential scoring
  const revenuePotentialScores = {
    LOW: 10,
    MEDIUM: 20,
    HIGH: 30,
    VERY_HIGH: 40,
  };
  score += revenuePotentialScores[opportunity.revenuePotential] || 0;

  // Market gap scoring
  const marketGapScores = {
    LOW: 5,
    MEDIUM: 15,
    HIGH: 25,
    VERY_HIGH: 35,
  };
  score += marketGapScores[opportunity.marketGap] || 0;

  // Competition level scoring (inverse)
  const competitionScores = {
    NONE: 25,
    LOW: 20,
    MEDIUM: 10,
    HIGH: 5,
    SATURATED: 0,
  };
  score += competitionScores[opportunity.competitionLevel] || 0;

  // Lead time bonus (longer lead time is better)
  if (opportunity.leadTimeMonths) {
    if (opportunity.leadTimeMonths >= 18) score += 15;
    else if (opportunity.leadTimeMonths >= 12) score += 10;
    else if (opportunity.leadTimeMonths >= 6) score += 5;
  }

  // Status penalty
  if (opportunity.status === 'LOST' || opportunity.status === 'ARCHIVED') {
    score = score * 0.5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}