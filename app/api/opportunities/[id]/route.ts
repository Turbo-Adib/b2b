import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for updating opportunities
const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  regulationType: z.string().optional(),
  regulationReference: z.string().optional(),
  implementationDate: z.string().datetime().optional(),
  deadlineDate: z.string().datetime().optional(),
  status: z.enum(['IDENTIFIED', 'RESEARCHING', 'POSITIONING', 'PURSUING', 'WON', 'LOST', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  revenuePotential: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  marketGap: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  competitionLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'SATURATED']).optional(),
  legislativeStage: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  affectedCountries: z.array(z.string()).optional(),
  estimatedMarketSize: z.number().optional(),
  complianceRequirements: z.string().optional(),
});

// GET /api/opportunities/[id] - Get single opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
      include: {
        competitors: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        governmentContacts: {
          include: {
            procurements: true,
          },
        },
        researchTasks: {
          orderBy: { createdAt: 'desc' },
        },
        alerts: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/opportunities/[id] - Update opportunity
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
    const validatedData = updateOpportunitySchema.parse(body);

    // Check ownership
    const existing = await prisma.opportunity.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Update lead time if implementation date changed
    let leadTimeMonths = existing.leadTimeMonths;
    if (validatedData.implementationDate) {
      leadTimeMonths = Math.floor(
        (new Date(validatedData.implementationDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24 * 30)
      );
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        leadTimeMonths,
        lastLegislativeUpdate: validatedData.legislativeStage ? new Date() : undefined,
      },
    });

    // Recalculate score
    const score = calculateOpportunityScore(opportunity);
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: params.id },
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
    console.error('Error updating opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/opportunities/[id] - Delete opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const existing = await prisma.opportunity.findFirst({
      where: {
        id: params.id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    await prisma.opportunity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function (duplicate from main route - should be extracted to lib)
function calculateOpportunityScore(opportunity: any): number {
  let score = 50; // Base score

  const revenuePotentialScores = {
    LOW: 10,
    MEDIUM: 20,
    HIGH: 30,
    VERY_HIGH: 40,
  };
  score += revenuePotentialScores[opportunity.revenuePotential] || 0;

  const marketGapScores = {
    LOW: 5,
    MEDIUM: 15,
    HIGH: 25,
    VERY_HIGH: 35,
  };
  score += marketGapScores[opportunity.marketGap] || 0;

  const competitionScores = {
    NONE: 25,
    LOW: 20,
    MEDIUM: 10,
    HIGH: 5,
    SATURATED: 0,
  };
  score += competitionScores[opportunity.competitionLevel] || 0;

  if (opportunity.leadTimeMonths) {
    if (opportunity.leadTimeMonths >= 18) score += 15;
    else if (opportunity.leadTimeMonths >= 12) score += 10;
    else if (opportunity.leadTimeMonths >= 6) score += 5;
  }

  if (opportunity.status === 'LOST' || opportunity.status === 'ARCHIVED') {
    score = score * 0.5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}