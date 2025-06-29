'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  ArrowUpRight,
  Clock,
  Building2,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your regulatory intelligence command center
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Opportunities
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Lead Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.5</div>
            <p className="text-xs text-muted-foreground">
              months ahead of market
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Tenders
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              €2.3M total value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Competitor Activity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              movements this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>High Priority Opportunities</CardTitle>
          <CardDescription>
            Regulations with highest revenue potential and optimal timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'EU AI Act Implementation Framework',
                score: 92,
                deadline: '18 months',
                revenue: 'Very High',
                competition: 'Low',
              },
              {
                title: 'Digital Services Act Compliance Certification',
                score: 87,
                deadline: '12 months',
                revenue: 'High',
                competition: 'Medium',
              },
              {
                title: 'Green Deal Reporting Standards',
                score: 84,
                deadline: '24 months',
                revenue: 'High',
                competition: 'Low',
              },
            ].map((opp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{opp.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {opp.deadline}
                    </span>
                    <Badge variant="outline">{opp.revenue} Revenue</Badge>
                    <Badge variant="outline">{opp.competition} Competition</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{opp.score}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <Button size="sm">
                    View
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            Important updates requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: 'competitor',
                title: 'McKinsey announces EU AI Act practice',
                time: '2 hours ago',
                priority: 'high',
              },
              {
                type: 'legislative',
                title: 'DSA enforcement guidelines published',
                time: '5 hours ago',
                priority: 'medium',
              },
              {
                type: 'procurement',
                title: 'New tender: German AI compliance audit',
                time: '1 day ago',
                priority: 'high',
              },
            ].map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.priority === 'high' ? 'text-destructive' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}