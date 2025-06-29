'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CompetitorSummary {
  name: string;
  totalActivities: number;
  opportunities: string[];
  latestActivity: string | null;
  threatLevels: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

interface CompetitorSummaryProps {
  summary: CompetitorSummary[];
}

export function CompetitorSummary({ summary }: CompetitorSummaryProps) {
  // Sort by total activities
  const sortedCompetitors = [...summary].sort((a, b) => b.totalActivities - a.totalActivities);
  
  // Calculate overall threat assessment
  const totalThreatScore = summary.reduce((acc, comp) => {
    return acc + 
      (comp.threatLevels.LOW * 1) +
      (comp.threatLevels.MEDIUM * 2) +
      (comp.threatLevels.HIGH * 3) +
      (comp.threatLevels.CRITICAL * 4);
  }, 0);

  const totalActivities = summary.reduce((acc, comp) => acc + comp.totalActivities, 0);
  const averageThreatLevel = totalActivities > 0 ? totalThreatScore / totalActivities : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Competitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracking activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Across all competitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Threat Level
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageThreatLevel.toFixed(1)}
            </div>
            <Progress 
              value={averageThreatLevel * 25} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High/Critical
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.reduce((acc, comp) => 
                acc + comp.threatLevels.HIGH + comp.threatLevels.CRITICAL, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Activities requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Rankings</CardTitle>
          <CardDescription>
            Most active competitors in your opportunity spaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCompetitors.slice(0, 10).map((competitor, index) => (
              <div key={competitor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{competitor.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{competitor.totalActivities} activities</span>
                        <span>{competitor.opportunities.length} opportunities</span>
                        {competitor.latestActivity && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last active {formatDistanceToNow(new Date(competitor.latestActivity), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {competitor.threatLevels.CRITICAL > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {competitor.threatLevels.CRITICAL} Critical
                      </Badge>
                    )}
                    {competitor.threatLevels.HIGH > 0 && (
                      <Badge variant="default" className="text-xs">
                        {competitor.threatLevels.HIGH} High
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Activity distribution bar */}
                <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                  {competitor.threatLevels.CRITICAL > 0 && (
                    <div 
                      className="bg-destructive"
                      style={{ width: `${(competitor.threatLevels.CRITICAL / competitor.totalActivities) * 100}%` }}
                    />
                  )}
                  {competitor.threatLevels.HIGH > 0 && (
                    <div 
                      className="bg-primary"
                      style={{ width: `${(competitor.threatLevels.HIGH / competitor.totalActivities) * 100}%` }}
                    />
                  )}
                  {competitor.threatLevels.MEDIUM > 0 && (
                    <div 
                      className="bg-secondary-foreground/50"
                      style={{ width: `${(competitor.threatLevels.MEDIUM / competitor.totalActivities) * 100}%` }}
                    />
                  )}
                  {competitor.threatLevels.LOW > 0 && (
                    <div 
                      className="bg-muted-foreground/30"
                      style={{ width: `${(competitor.threatLevels.LOW / competitor.totalActivities) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}