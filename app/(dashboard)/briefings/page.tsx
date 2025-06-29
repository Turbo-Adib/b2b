'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Target,
  Users,
  Building2,
  DollarSign,
  Mail,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export default function BriefingsPage() {
  const [briefing, setBriefing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchBriefing();
  }, [selectedDate]);

  async function fetchBriefing() {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/briefings?date=${dateStr}`);
      const data = await response.json();
      setBriefing(data.briefing);
    } catch (error) {
      console.error('Error fetching briefing:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateBriefing() {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/briefings/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: format(selectedDate, 'yyyy-MM-dd') }),
      });
      
      if (!response.ok) throw new Error('Failed to generate briefing');
      
      await fetchBriefing();
    } catch (error) {
      console.error('Error generating briefing:', error);
      alert('Failed to generate briefing');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading briefing...</div>;
  }

  const stats = briefing?.stats || {
    newOpportunities: 0,
    competitorActivities: 0,
    governmentUpdates: 0,
    executiveAlerts: 0,
    totalAlerts: 0,
    highPriorityItems: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Intelligence Briefing</h1>
          <p className="text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSelectedDate(subDays(new Date(), 1))}>
            <Calendar className="mr-2 h-4 w-4" />
            Previous Day
          </Button>
          {!briefing && (
            <Button onClick={generateBriefing} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Briefing
                </>
              )}
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email Briefing
          </Button>
        </div>
      </div>

      {!briefing ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No briefing available for this date.
            </p>
            <Button onClick={generateBriefing} disabled={isGenerating}>
              Generate Today&apos;s Briefing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newOpportunities}</div>
                <p className="text-xs text-muted-foreground">Identified today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Competitor Moves</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.competitorActivities}</div>
                <p className="text-xs text-muted-foreground">Activities tracked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gov Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.governmentUpdates}</div>
                <p className="text-xs text-muted-foreground">New signals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Executive Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.executiveAlerts}</div>
                <p className="text-xs text-muted-foreground">Vulnerability changes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAlerts}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.highPriorityItems}</div>
                <p className="text-xs text-muted-foreground">Action required</p>
              </CardContent>
            </Card>
          </div>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                Key insights and action items for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p>{briefing.executiveSummary || 'No executive summary available.'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Sections */}
          <Tabs defaultValue="opportunities" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="government">Government</TabsTrigger>
              <TabsTrigger value="executives">Executives</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>New Regulatory Opportunities</CardTitle>
                  <CardDescription>
                    High-value opportunities identified in the last 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {briefing.opportunities?.length > 0 ? (
                    <div className="space-y-3">
                      {briefing.opportunities.map((opp: any) => (
                        <div key={opp.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{opp.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {opp.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="secondary">
                                  Score: {opp.opportunityScore}%
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  €{(opp.revenuePotential / 1000).toFixed(0)}k potential
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Target className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No new opportunities today</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Activity</CardTitle>
                  <CardDescription>
                    Latest movements from tracked competitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {briefing.competitorActivities?.length > 0 ? (
                    <div className="space-y-3">
                      {briefing.competitorActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{activity.competitorName}</h4>
                              <Badge variant={activity.threatLevel === 'high' ? 'destructive' : 'default'}>
                                {activity.threatLevel} threat
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.activityType}: {activity.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No competitor activities detected</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="government" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Government Updates</CardTitle>
                  <CardDescription>
                    New procurements, policy changes, and contact updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upcoming Deadlines */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Upcoming Deadlines</h4>
                      {briefing.upcomingDeadlines?.length > 0 ? (
                        <div className="space-y-2">
                          {briefing.upcomingDeadlines.map((deadline: any) => (
                            <div key={deadline.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{deadline.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {deadline.region} - €{(deadline.estimatedValue / 1000).toFixed(0)}k
                                </p>
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                {deadline.daysUntil} days
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No urgent deadlines</p>
                      )}
                    </div>

                    {/* New Contacts */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">New Government Contacts</h4>
                      {briefing.newContacts?.length > 0 ? (
                        <div className="space-y-2">
                          {briefing.newContacts.map((contact: any) => (
                            <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="text-sm font-medium">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contact.title} - {contact.department}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {contact.influenceLevel}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No new contacts added</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="executives" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Vulnerability Changes</CardTitle>
                  <CardDescription>
                    Pressure points and opportunity signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {briefing.executiveAlerts?.length > 0 ? (
                    <div className="space-y-3">
                      {briefing.executiveAlerts.map((alert: any) => (
                        <div key={alert.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {alert.executiveName} - {alert.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {alert.companyName}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="destructive">
                                  Vulnerability: {alert.vulnerabilityScore}%
                                </Badge>
                                {alert.changeType === 'increase' ? (
                                  <span className="text-xs text-red-500 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +{alert.changeAmount}%
                                  </span>
                                ) : (
                                  <span className="text-xs text-green-500 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                                    -{alert.changeAmount}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No significant changes detected</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Action Items</CardTitle>
              <CardDescription>
                Tasks requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {briefing.actionItems?.length > 0 ? (
                <div className="space-y-3">
                  {briefing.actionItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      {item.priority === 'high' ? (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      ) : item.priority === 'medium' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No urgent action items today</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}