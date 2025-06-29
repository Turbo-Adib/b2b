import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for updating competitor activity
const updateCompetitorSchema = z.object({
  competitorName: z.string().min(1).optional(),
  activityType: z.string().min(1).optional(),
  activityDate: z.string().datetime().optional(),
  description: z.string().min(1).optional(),
  sourceUrl: z.string().url().optional(),
  threatLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

// GET /api/competitors/[id] - Get single competitor activity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const competitor = await prisma.competitorActivity.findFirst({
      where: {
        id: params.id,
        opportunity: {
          userId: session.userId,
        },
      },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: 'Competitor activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ competitor });
  } catch (error) {
    console.error('Error fetching competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/competitors/[id] - Update competitor activity
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
    const validatedData = updateCompetitorSchema.parse(body);

    // Check ownership
    const existing = await prisma.competitorActivity.findFirst({
      where: {
        id: params.id,
        opportunity: {
          userId: session.userId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Competitor activity not found' },
        { status: 404 }
      );
    }

    const competitor = await prisma.competitorActivity.update({
      where: { id: params.id },
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

    return NextResponse.json({ competitor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/competitors/[id] - Delete competitor activity
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
    const existing = await prisma.competitorActivity.findFirst({
      where: {
        id: params.id,
        opportunity: {
          userId: session.userId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Competitor activity not found' },
        { status: 404 }
      );
    }

    await prisma.competitorActivity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}