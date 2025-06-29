import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';

const prisma = new PrismaClient();

// GET /api/alerts - Get alerts with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const entityId = searchParams.get('entityId');
    const isRead = searchParams.get('isRead');
    const severity = searchParams.get('severity');

    const where: any = {
      userId: session.userId,
    };

    if (type) where.type = type;
    if (entityId) where.entityId = entityId;
    if (isRead !== null) where.isRead = isRead === 'true';
    if (severity) where.severity = severity;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}