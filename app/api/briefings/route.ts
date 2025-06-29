import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const prisma = new PrismaClient();

// GET /api/briefings - Get briefing for a specific date
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    const date = parseISO(dateStr);
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // Check if briefing exists for this date
    const existingBriefing = await prisma.report.findFirst({
      where: {
        userId: session.userId,
        type: 'daily_briefing',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (existingBriefing) {
      return NextResponse.json({ 
        briefing: JSON.parse(existingBriefing.content as string) 
      });
    }

    return NextResponse.json({ briefing: null });
  } catch (error) {
    console.error('Error fetching briefing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}