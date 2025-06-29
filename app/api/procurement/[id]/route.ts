import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for updating procurement
const updateProcurementSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  procurementNumber: z.string().optional(),
  region: z.string().optional(),
  issuingAuthority: z.string().optional(),
  publishDate: z.string().datetime().optional(),
  submissionDeadline: z.string().datetime().optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  status: z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'AWARDED', 'CANCELLED']).optional(),
  serviceGap: z.boolean().optional(),
  bottleneck: z.boolean().optional(),
  gapAnalysis: z.string().optional(),
  proposalDraft: z.string().optional(),
  winProbability: z.number().min(0).max(100).optional(),
});

// GET /api/procurement/[id] - Get single procurement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const procurement = await prisma.procurement.findUnique({
      where: { id: params.id },
      include: {
        contacts: {
          include: {
            opportunity: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!procurement) {
      return NextResponse.json(
        { error: 'Procurement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ procurement });
  } catch (error) {
    console.error('Error fetching procurement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/procurement/[id] - Update procurement
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
    const validatedData = updateProcurementSchema.parse(body);

    const procurement = await prisma.procurement.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        contacts: true,
        documents: true,
      },
    });

    return NextResponse.json({ procurement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating procurement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/procurement/[id] - Delete procurement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.procurement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting procurement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/procurement/[id]/contacts - Add contact to procurement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = await request.json();

    // Verify procurement exists
    const procurement = await prisma.procurement.findUnique({
      where: { id: params.id },
    });

    if (!procurement) {
      return NextResponse.json(
        { error: 'Procurement not found' },
        { status: 404 }
      );
    }

    // Update the contact to link to this procurement
    await prisma.procurement.update({
      where: { id: params.id },
      data: {
        contacts: {
          connect: { id: contactId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}