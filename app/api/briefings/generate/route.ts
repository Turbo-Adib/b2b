import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { getSession } from '@/lib/auth/session';
import { startOfDay, endOfDay, parseISO, subDays } from 'date-fns';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for generating briefing
const generateBriefingSchema = z.object({
  date: z.string(),
});

// POST /api/briefings/generate - Generate a new daily briefing
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date: dateStr } = generateBriefingSchema.parse(body);
    
    const date = parseISO(dateStr);
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    const yesterday = subDays(startDate, 1);

    // Gather data for the briefing
    const [opportunities, competitorActivities, procurements, executives, alerts, recentCompanies] = await Promise.all([
      // New opportunities (created in last 24 hours)
      prisma.opportunity.findMany({
        where: {
          userId: session.userId,
          createdAt: {
            gte: yesterday,
            lte: endDate,
          },
        },
        orderBy: { opportunityScore: 'desc' },
        take: 5,
      }),
      
      // Recent competitor activities
      prisma.competitorActivity.findMany({
        where: {
          userId: session.userId,
          activityDate: {
            gte: yesterday,
            lte: endDate,
          },
        },
        orderBy: { activityDate: 'desc' },
        take: 10,
      }),
      
      // Upcoming procurement deadlines
      prisma.procurement.findMany({
        where: {
          userId: session.userId,
          deadline: {
            gte: startDate,
            lte: subDays(startDate, -14), // Next 14 days
          },
          status: 'active',
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
      
      // Executive vulnerability changes
      prisma.executive.findMany({
        where: {
          userId: session.userId,
          updatedAt: {
            gte: yesterday,
            lte: endDate,
          },
          vulnerabilityScore: {
            gte: 60,
          },
        },
        include: {
          company: true,
        },
        orderBy: { vulnerabilityScore: 'desc' },
        take: 10,
      }),
      
      // Recent alerts
      prisma.alert.findMany({
        where: {
          userId: session.userId,
          createdAt: {
            gte: yesterday,
            lte: endDate,
          },
          isRead: false,
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Companies under pressure
      prisma.company.findMany({
        where: {
          userId: session.userId,
          pressureScore: {
            gte: 70,
          },
        },
        include: {
          executives: {
            where: {
              vulnerabilityScore: {
                gte: 60,
              },
            },
          },
        },
        orderBy: { pressureScore: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate stats
    const stats = {
      newOpportunities: opportunities.length,
      competitorActivities: competitorActivities.length,
      governmentUpdates: procurements.length,
      executiveAlerts: executives.length,
      totalAlerts: alerts.length,
      highPriorityItems: alerts.filter(a => a.severity === 'high').length,
    };

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary({
      opportunities,
      competitorActivities,
      procurements,
      executives,
      alerts,
      companies: recentCompanies,
    });

    // Generate action items
    const actionItems = generateActionItems({
      opportunities,
      procurements,
      executives,
      alerts,
    });

    // Format briefing data
    const briefingData = {
      date: dateStr,
      stats,
      executiveSummary,
      opportunities: opportunities.map(opp => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        opportunityScore: opp.opportunityScore,
        revenuePotential: opp.revenuePotential,
      })),
      competitorActivities: competitorActivities.map(activity => ({
        id: activity.id,
        competitorName: activity.competitorName,
        activityType: activity.activityType,
        description: activity.description,
        threatLevel: activity.threatLevel,
      })),
      upcomingDeadlines: procurements.map(proc => ({
        id: proc.id,
        title: proc.title,
        region: proc.region,
        estimatedValue: proc.estimatedValue,
        daysUntil: Math.ceil((new Date(proc.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      })),
      executiveAlerts: executives.map(exec => ({
        id: exec.id,
        executiveName: exec.name,
        title: exec.title,
        companyName: exec.company.name,
        vulnerabilityScore: exec.vulnerabilityScore,
        changeType: 'increase', // In real app, track historical changes
        changeAmount: 5, // Placeholder
      })),
      actionItems,
      generatedAt: new Date().toISOString(),
    };

    // Save briefing as a report
    await prisma.report.create({
      data: {
        userId: session.userId,
        type: 'daily_briefing',
        title: `Daily Briefing - ${dateStr}`,
        content: JSON.stringify(briefingData),
        status: 'completed',
      },
    });

    return NextResponse.json({ success: true, briefing: briefingData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error generating briefing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateExecutiveSummary(data: any): string {
  const { opportunities, competitorActivities, procurements, executives, alerts, companies } = data;
  
  let summary = '';
  
  if (opportunities.length > 0) {
    summary += `Today we identified ${opportunities.length} new regulatory opportunities with a combined revenue potential of €${opportunities.reduce((sum: number, opp: any) => sum + (opp.revenuePotential || 0), 0) / 1000}k. `;
  }
  
  if (competitorActivities.length > 0) {
    const highThreat = competitorActivities.filter((a: any) => a.threatLevel === 'high').length;
    if (highThreat > 0) {
      summary += `${highThreat} high-threat competitor activities require immediate attention. `;
    }
  }
  
  if (procurements.length > 0) {
    summary += `${procurements.length} government procurement deadlines are approaching in the next 14 days. `;
  }
  
  if (executives.length > 0) {
    summary += `${executives.length} executives show increased vulnerability, presenting potential engagement opportunities. `;
  }
  
  if (alerts.filter((a: any) => a.severity === 'high').length > 0) {
    summary += `${alerts.filter((a: any) => a.severity === 'high').length} high-priority alerts require immediate action. `;
  }
  
  if (!summary) {
    summary = 'No significant activities or alerts today. Continue monitoring for new opportunities.';
  }
  
  return summary.trim();
}

function generateActionItems(data: any): any[] {
  const { opportunities, procurements, executives, alerts } = data;
  const actionItems = [];
  
  // High-scoring opportunities
  opportunities
    .filter((opp: any) => opp.opportunityScore >= 80)
    .forEach((opp: any) => {
      actionItems.push({
        priority: 'high',
        title: `Research opportunity: ${opp.title}`,
        description: `High-scoring opportunity (${opp.opportunityScore}%) with €${(opp.revenuePotential / 1000).toFixed(0)}k potential`,
      });
    });
  
  // Urgent procurements
  procurements
    .filter((proc: any) => {
      const daysUntil = Math.ceil((new Date(proc.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    })
    .forEach((proc: any) => {
      const daysUntil = Math.ceil((new Date(proc.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      actionItems.push({
        priority: 'high',
        title: `Prepare bid: ${proc.title}`,
        description: `Deadline in ${daysUntil} days - €${(proc.estimatedValue / 1000).toFixed(0)}k value`,
      });
    });
  
  // High vulnerability executives
  executives
    .filter((exec: any) => exec.vulnerabilityScore >= 80)
    .slice(0, 3)
    .forEach((exec: any) => {
      actionItems.push({
        priority: 'medium',
        title: `Engage with ${exec.name}`,
        description: `${exec.title} at ${exec.company.name} - vulnerability score ${exec.vulnerabilityScore}%`,
      });
    });
  
  // High severity alerts
  alerts
    .filter((alert: any) => alert.severity === 'high')
    .slice(0, 5)
    .forEach((alert: any) => {
      actionItems.push({
        priority: 'high',
        title: 'Address alert',
        description: alert.message,
      });
    });
  
  return actionItems.slice(0, 10); // Limit to top 10 action items
}