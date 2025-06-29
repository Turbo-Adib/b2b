'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Linkedin,
  Edit,
  AlertTriangle,
  Target,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExecutiveForm } from '@/components/executives/executive-form';

export default function ExecutiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [executive, setExecutive] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchExecutive();
    }
  }, [params.id]);

  useEffect(() => {
    if (executive) {
      fetchRelatedData();
    }
  }, [executive]);

  async function fetchExecutive() {
    try {
      const response = await fetch(`/api/executives/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch executive');
      const data = await response.json();
      setExecutive(data);
    } catch (error) {
      console.error('Error fetching executive:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRelatedData() {
    try {
      // Fetch opportunities based on executive's vulnerability and company
      const oppsResponse = await fetch(`/api/opportunities?search=${encodeURIComponent(executive.company.name)}`);
      const oppsData = await oppsResponse.json();
      setOpportunities(oppsData.opportunities || []);

      // Fetch alerts
      const alertsResponse = await fetch(`/api/alerts?type=executive&entityId=${params.id}`);
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading executive details...</div>;
  }

  if (!executive) {
    return <div className="flex items-center justify-center py-8">Executive not found</div>;
  }

  function getVulnerabilityColor(score: number) {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  }

  const RISK_FACTOR_LABELS: Record<string, string> = {
    'pipeline_pressure': 'Pipeline Pressure',
    'ad_spend_waste': 'Ad Spend Waste',
    'board_pressure': 'Board Pressure',
    'no_gtm_team': 'No GTM Team',
    'founder_led_sales': 'Founder-Led Sales',
    'recent_hire': 'Recent Hire',
    'public_criticism': 'Public Criticism',
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/executives')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{executive.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{executive.title}</span>
              <span className="text-muted-foreground">at</span>
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => router.push(`/companies/${executive.company.id}`)}
              >
                {executive.company.name}
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Executive
        </Button>
      </div>

      {/* Vulnerability Score and Key Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vulnerability Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{executive.vulnerabilityScore}%</span>
                <Badge variant={getVulnerabilityColor(executive.vulnerabilityScore)}>
                  {executive.vulnerabilityScore >= 70 ? 'High' : executive.vulnerabilityScore >= 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <Progress value={executive.vulnerabilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Company Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{executive.company.pressureScore}%</span>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              {executive.company.gtmGapDetected ? 'GTM gap detected' : 'Company health'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{executive.riskFactors.length}</p>
            <p className="text-xs text-muted-foreground">Active pressures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Desperation Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{executive.desperationSignals.length}</p>
            <p className="text-xs text-muted-foreground">Detected behaviors</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact & Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Engagement</CardTitle>
          <CardDescription>
            Communication channels and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="space-y-2">
                {executive.email ? (
                  <a
                    href={`mailto:${executive.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {executive.email}
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    No email on file
                  </div>
                )}
                {executive.linkedinUrl ? (
                  <a
                    href={executive.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Linkedin className="h-4 w-4" />
                    No LinkedIn profile
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">LinkedIn Activity</h4>
              {executive.lastLinkedinPost ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Last post {formatDistanceToNow(new Date(executive.lastLinkedinPost), { addSuffix: true })}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity tracked</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pressure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Pressure Analysis</CardTitle>
          <CardDescription>
            Risk factors and behavioral signals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {executive.riskFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
              <div className="flex flex-wrap gap-2">
                {executive.riskFactors.map((factor: string) => (
                  <Badge key={factor} variant="outline">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {RISK_FACTOR_LABELS[factor] || factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {executive.desperationSignals.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Desperation Signals</h4>
              <div className="flex flex-wrap gap-2">
                {executive.desperationSignals.map((signal: string) => (
                  <Badge key={signal} variant="destructive">
                    {signal.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {executive.opportunityType && (
            <div>
              <h4 className="font-medium text-sm mb-2">Recommended Approach</h4>
              <Badge variant="secondary" className="text-sm">
                <Target className="mr-1 h-3 w-3" />
                {executive.opportunityType}
              </Badge>
            </div>
          )}

          {executive.notes && (
            <div>
              <h4 className="font-medium text-sm mb-2">Analysis Notes</h4>
              <p className="text-sm text-muted-foreground">{executive.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Context */}
      <Card>
        <CardHeader>
          <CardTitle>Company Context</CardTitle>
          <CardDescription>
            {executive.company.name} status and indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Funding Status</h4>
              {executive.company.lastFundingDate ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {executive.company.lastFundingRound} - 
                      ${(executive.company.lastFundingAmount / 1000000).toFixed(0)}M
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(executive.company.lastFundingDate), { addSuffix: true })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No funding data available</p>
              )}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Pressure Indicators</h4>
              <div className="space-y-2">
                {executive.company.gtmGapDetected && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span>GTM gap - no sales/growth hires</span>
                  </div>
                )}
                {executive.company.executiveTurnover && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>High executive turnover</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              Recent changes and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadAlerts.map((alert) => (
                <Alert key={alert.id}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p>{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Recommendations</CardTitle>
          <CardDescription>
            Based on vulnerability profile and company status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No specific opportunities identified yet
            </p>
          ) : (
            <div className="space-y-3">
              {opportunities.slice(0, 3).map((opp) => (
                <div key={opp.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{opp.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {opp.description.substring(0, 100)}...
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Match Score: {opp.opportunityScore}%
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/opportunities/${opp.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExecutiveForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        executive={executive}
      />
    </div>
  );
}