import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating government contact
const createContactSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  department: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  role: z.string().min(1),
  influence: z.enum(['LOW', 'MEDIUM', 'HIGH', 'KEY_DECISION_MAKER']).default('MEDIUM'),
  notes: z.string().optional(),
  opportunityId: z.string().optional(),
});

// GET /api/government-contacts - List contacts
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    const influence = searchParams.get('influence');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (opportunityId) where.opportunityId = opportunityId;
    if (influence) where.influence = influence;
    if (department) {
      where.department = {
        contains: department,
        mode: 'insensitive',
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const contacts = await prisma.governmentContact.findMany({
      where,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
        procurements: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [
        { influence: 'desc' },
        { name: 'asc' },
      ],
    });

    // Group by department for summary
    const departmentSummary = contacts.reduce((acc: any, contact) => {
      if (!acc[contact.department]) {
        acc[contact.department] = {
          department: contact.department,
          count: 0,
          keyDecisionMakers: 0,
          withContact: 0,
        };
      }
      acc[contact.department].count++;
      if (contact.influence === 'KEY_DECISION_MAKER') {
        acc[contact.department].keyDecisionMakers++;
      }
      if (contact.email || contact.phone) {
        acc[contact.department].withContact++;
      }
      return acc;
    }, {});

    // Calculate influence distribution
    const influenceDistribution = {
      LOW: contacts.filter(c => c.influence === 'LOW').length,
      MEDIUM: contacts.filter(c => c.influence === 'MEDIUM').length,
      HIGH: contacts.filter(c => c.influence === 'HIGH').length,
      KEY_DECISION_MAKER: contacts.filter(c => c.influence === 'KEY_DECISION_MAKER').length,
    };

    return NextResponse.json({
      contacts,
      departmentSummary: Object.values(departmentSummary),
      influenceDistribution,
      total: contacts.length,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/government-contacts - Create contact
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createContactSchema.parse(body);

    // If linked to opportunity, verify ownership
    if (validatedData.opportunityId) {
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
    }

    const contact = await prisma.governmentContact.create({
      data: validatedData,
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
        procurements: true,
      },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}