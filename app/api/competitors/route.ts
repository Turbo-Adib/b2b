import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating competitor activity
const createCompetitorSchema = z.object({
  opportunityId: z.string(),
  competitorName: z.string().min(1),
  activityType: z.string().min(1),
  activityDate: z.string().datetime(),
  description: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  threatLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
});

// GET /api/competitors - List all competitor activities
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const threatLevel = searchParams.get('threatLevel');
    const competitorName = searchParams.get('competitorName');
    const days = searchParams.get('days'); // Filter by last N days

    // Build where clause
    const where: any = {};
    
    // Ensure user owns the opportunities
    where.opportunity = { userId: session.userId };
    
    if (opportunityId) where.opportunityId = opportunityId;
    if (threatLevel) where.threatLevel = threatLevel;
    if (competitorName) {
      where.competitorName = {
        contains: competitorName,
        mode: 'insensitive',
      };
    }
    
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      where.activityDate = { gte: daysAgo };
    }

    const competitors = await prisma.competitorActivity.findMany({
      where,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { activityDate: 'desc' },
    });

    // Group by competitor for summary view
    const competitorSummary = competitors.reduce((acc: any, activity) => {
      if (!acc[activity.competitorName]) {
        acc[activity.competitorName] = {
          name: activity.competitorName,
          totalActivities: 0,
          opportunities: new Set(),
          latestActivity: null,
          threatLevels: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        };
      }
      
      acc[activity.competitorName].totalActivities++;
      acc[activity.competitorName].opportunities.add(activity.opportunity.title);
      acc[activity.competitorName].threatLevels[activity.threatLevel]++;
      
      if (!acc[activity.competitorName].latestActivity || 
          new Date(activity.activityDate) > new Date(acc[activity.competitorName].latestActivity)) {
        acc[activity.competitorName].latestActivity = activity.activityDate;
      }
      
      return acc;
    }, {});

    // Convert Set to Array for JSON serialization
    const summary = Object.values(competitorSummary).map((comp: any) => ({
      ...comp,
      opportunities: Array.from(comp.opportunities),
    }));

    return NextResponse.json({
      activities: competitors,
      summary,
      total: competitors.length,
    });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/competitors - Create competitor activity
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCompetitorSchema.parse(body);

    // Verify user owns the opportunity
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id: validatedData.opportunityId,
        userId: session.userId,
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    const competitor = await prisma.competitorActivity.create({
      data: validatedData,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create alert for high/critical threat levels
    if (validatedData.threatLevel === 'HIGH' || validatedData.threatLevel === 'CRITICAL') {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'COMPETITOR_ACTIVITY',
          priority: validatedData.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          title: `High threat competitor activity: ${validatedData.competitorName}`,
          message: `${validatedData.competitorName} has been detected with ${validatedData.activityType} activity for opportunity "${opportunity.title}". Threat level: ${validatedData.threatLevel}`,
          opportunityId: validatedData.opportunityId,
          actionRequired: true,
        },
      });
    }

    return NextResponse.json({ competitor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating competitor activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}