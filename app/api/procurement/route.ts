import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating procurement
const createProcurementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  procurementNumber: z.string().optional(),
  region: z.string().min(1),
  issuingAuthority: z.string().min(1),
  publishDate: z.string().datetime(),
  submissionDeadline: z.string().datetime().optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'AWARDED', 'CANCELLED']).default('OPEN'),
  serviceGap: z.boolean().default(false),
  bottleneck: z.boolean().default(false),
  gapAnalysis: z.string().optional(),
  proposalDraft: z.string().optional(),
  winProbability: z.number().min(0).max(100).optional(),
});

// GET /api/procurement - List procurements
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');
    const serviceGap = searchParams.get('serviceGap');
    const bottleneck = searchParams.get('bottleneck');
    const days = searchParams.get('days');

    // Build where clause
    const where: any = {};
    
    if (region) where.region = region;
    if (status) where.status = status;
    if (serviceGap === 'true') where.serviceGap = true;
    if (bottleneck === 'true') where.bottleneck = true;
    
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      where.publishDate = { gte: daysAgo };
    }

    const procurements = await prisma.procurement.findMany({
      where,
      include: {
        contacts: {
          select: {
            id: true,
            name: true,
            title: true,
            department: true,
            influence: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { submissionDeadline: 'asc' },
    });

    // Calculate statistics
    const stats = {
      total: procurements.length,
      open: procurements.filter(p => p.status === 'OPEN').length,
      totalValue: procurements.reduce((sum, p) => {
        return sum + (p.estimatedValue ? parseFloat(p.estimatedValue.toString()) : 0);
      }, 0),
      serviceGaps: procurements.filter(p => p.serviceGap).length,
      bottlenecks: procurements.filter(p => p.bottleneck).length,
      upcomingDeadlines: procurements.filter(p => {
        if (!p.submissionDeadline) return false;
        const deadline = new Date(p.submissionDeadline);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return deadline <= weekFromNow && deadline >= new Date();
      }).length,
    };

    // Group by region for summary
    const regionSummary = procurements.reduce((acc: any, proc) => {
      if (!acc[proc.region]) {
        acc[proc.region] = {
          region: proc.region,
          count: 0,
          value: 0,
          open: 0,
          serviceGaps: 0,
        };
      }
      acc[proc.region].count++;
      acc[proc.region].value += proc.estimatedValue ? parseFloat(proc.estimatedValue.toString()) : 0;
      if (proc.status === 'OPEN') acc[proc.region].open++;
      if (proc.serviceGap) acc[proc.region].serviceGaps++;
      return acc;
    }, {});

    return NextResponse.json({
      procurements,
      stats,
      regionSummary: Object.values(regionSummary),
    });
  } catch (error) {
    console.error('Error fetching procurements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/procurement - Create procurement
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProcurementSchema.parse(body);

    const procurement = await prisma.procurement.create({
      data: validatedData,
      include: {
        contacts: true,
        documents: true,
      },
    });

    // Create alert for upcoming deadline if within 30 days
    if (validatedData.submissionDeadline) {
      const deadline = new Date(validatedData.submissionDeadline);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (deadline <= thirtyDaysFromNow) {
        await prisma.alert.create({
          data: {
            userId: session.userId,
            type: 'PROCUREMENT_MATCH',
            priority: deadline <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'HIGH' : 'MEDIUM',
            title: `Upcoming tender deadline: ${validatedData.title}`,
            message: `Submission deadline for ${validatedData.title} is ${deadline.toLocaleDateString()}. Region: ${validatedData.region}, Authority: ${validatedData.issuingAuthority}`,
            actionRequired: true,
            actionUrl: `/procurement/${procurement.id}`,
          },
        });
      }
    }

    // Create alert for service gaps or bottlenecks
    if (validatedData.serviceGap || validatedData.bottleneck) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'MARKET_SIGNAL',
          priority: 'HIGH',
          title: `${validatedData.serviceGap ? 'Service Gap' : 'Bottleneck'} Identified: ${validatedData.title}`,
          message: `A ${validatedData.serviceGap ? 'service gap' : 'bottleneck'} has been identified in ${validatedData.region}. This represents a high-leverage opportunity.`,
          actionRequired: true,
          actionUrl: `/procurement/${procurement.id}`,
        },
      });
    }

    return NextResponse.json({ procurement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating procurement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}