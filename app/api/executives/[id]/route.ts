import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for updating executive
const updateExecutiveSchema = z.object({
  companyId: z.string().optional(),
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  linkedinUrl: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  riskFactors: z.array(z.string()).optional(),
  desperationSignals: z.array(z.string()).optional(),
  lastLinkedinPost: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
  opportunityType: z.string().optional().nullable(),
});

// GET /api/executives/[id] - Get single executive
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const executive = await prisma.executive.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!executive) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(executive);
  } catch (error) {
    console.error('Error fetching executive:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/executives/[id] - Update executive
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
    const validatedData = updateExecutiveSchema.parse(body);

    // Get current executive for vulnerability score calculation
    const currentExecutive = await prisma.executive.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    });

    if (!currentExecutive) {
      return NextResponse.json(
        { error: 'Executive not found' },
        { status: 404 }
      );
    }

    // Recalculate vulnerability score
    const updatedExecutive = { ...currentExecutive, ...validatedData };
    const vulnerabilityScore = calculateVulnerabilityScore(updatedExecutive);

    const executive = await prisma.executive.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        vulnerabilityScore,
      },
      include: {
        company: true,
        alerts: true,
      },
    });

    // Check if we need to create alert for high vulnerability
    if (vulnerabilityScore >= 70 && currentExecutive.vulnerabilityScore < 70) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'executive',
          entityId: executive.id,
          severity: 'high',
          message: `${executive.name} (${executive.title}) vulnerability increased to ${vulnerabilityScore}%`,
        },
      });
    }

    return NextResponse.json(executive);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating executive:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/executives/[id] - Delete executive
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.executive.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting executive:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function (duplicate - should be extracted)
function calculateVulnerabilityScore(executive: any): number {
  let score = 0;

  // Title-based vulnerability (max 20 points)
  if (executive.title) {
    const title = executive.title.toLowerCase();
    if (title.includes('cmo') || title.includes('chief marketing')) score += 20;
    else if (title.includes('cro') || title.includes('chief revenue')) score += 18;
    else if (title.includes('vp sales') || title.includes('vp marketing')) score += 15;
    else if (title.includes('director')) score += 10;
  }

  // Risk factors (each adds 10 points, max 40)
  const riskScore = Math.min(40, (executive.riskFactors?.length || 0) * 10);
  score += riskScore;

  // Desperation signals (each adds 15 points, max 30)
  const desperationScore = Math.min(30, (executive.desperationSignals?.length || 0) * 15);
  score += desperationScore;

  // Company pressure adds to personal vulnerability (max 10)
  if (executive.company?.pressureScore) {
    score += Math.floor(executive.company.pressureScore * 0.1);
  }

  return Math.min(100, Math.max(0, score));
}