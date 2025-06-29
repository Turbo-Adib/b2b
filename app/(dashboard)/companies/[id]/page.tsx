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
  DollarSign,
  Edit,
  Globe,
  Linkedin,
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ExecutiveList } from '@/components/executives/executive-list';
import { ExecutiveForm } from '@/components/executives/executive-form';
import { CompanyForm } from '@/components/companies/company-form';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExecutiveFormOpen, setIsExecutiveFormOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCompany();
    }
  }, [params.id]);

  useEffect(() => {
    if (company) {
      fetchRelatedData();
    }
  }, [company]);

  async function fetchCompany() {
    try {
      const response = await fetch(`/api/companies/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch company');
      const data = await response.json();
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRelatedData() {
    try {
      // Fetch opportunities that mention this company
      const oppsResponse = await fetch(`/api/opportunities?search=${encodeURIComponent(company?.name || '')}`);
      const oppsData = await oppsResponse.json();
      setOpportunities(oppsData.opportunities || []);

      // Fetch alerts for this company
      const alertsResponse = await fetch(`/api/alerts?type=company&entityId=${params.id}`);
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  }

  async function markAlertRead(alertId: string) {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      fetchRelatedData();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading company details...</div>;
  }

  if (!company) {
    return <div className="flex items-center justify-center py-8">Company not found</div>;
  }

  const vulnerableExecs = company.executives.filter((e: any) => e.vulnerabilityScore >= 70);
  const recentAlerts = alerts.filter(a => !a.isRead);

  function getPressureColor(score: number) {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  }

  function formatFunding(amount?: number) {
    if (!amount) return null;
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/companies')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{company.industry}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Company
        </Button>
      </div>

      {/* Pressure Score and Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pressure Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{company.pressureScore}%</span>
                <Badge variant={getPressureColor(company.pressureScore)}>
                  {company.pressureScore >= 70 ? 'High' : company.pressureScore >= 40 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <Progress value={company.pressureScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Funding</CardTitle>
          </CardHeader>
          <CardContent>
            {company.lastFundingDate ? (
              <div>
                <p className="text-2xl font-bold">
                  {company.lastFundingRound} {formatFunding(company.lastFundingAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(company.lastFundingDate), { addSuffix: true })}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No funding data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatFunding(company.totalFunding) || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Lifetime funding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vulnerable Executives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vulnerableExecs.length}</p>
            <p className="text-xs text-muted-foreground">
              Out of {company.executives.length} tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chaos Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Chaos Indicators</CardTitle>
          <CardDescription>
            Key pressure points and vulnerability signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Company Pressure Points</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {company.lastFundingDate
                      ? `${Math.floor((Date.now() - new Date(company.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24))} days since funding`
                      : 'No funding data'}
                  </span>
                </div>
                {company.gtmGapDetected && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">GTM gap detected - no sales/growth hires</span>
                  </div>
                )}
                {company.executiveTurnover && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">High executive turnover</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">External Links</h4>
              <div className="space-y-2">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Company Website
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          </div>
          {company.analysisNotes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Analysis Notes</h4>
              <p className="text-sm text-muted-foreground">{company.analysisNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              Unread notifications and warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <Alert key={alert.id}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p>{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAlertRead(alert.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="executives" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executives">
            Executives ({company.executives.length})
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities ({opportunities.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executives" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tracked Executives</h3>
            <Button onClick={() => setIsExecutiveFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Track Executive
            </Button>
          </div>
          <ExecutiveList
            executives={company.executives}
            showCompany={false}
          />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <h3 className="text-lg font-semibold">Related Opportunities</h3>
          {opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No opportunities linked to this company yet
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <Card key={opp.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{opp.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opp.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">
                            Score: {opp.opportunityScore}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {opp.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/opportunities/${opp.id}`)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <div className="space-y-4">
            {/* Funding events */}
            {company.lastFundingDate && (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <div className="w-0.5 h-16 bg-border" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {company.lastFundingRound} - {formatFunding(company.lastFundingAmount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(company.lastFundingDate), 'PPP')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Executive additions */}
            {company.executives.map((exec: any, index: number) => (
              <div key={exec.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-secondary rounded-full" />
                  {index < company.executives.length - 1 && (
                    <div className="w-0.5 h-16 bg-border" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {exec.name} joined as {exec.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(exec.createdAt), 'PPP')}
                  </p>
                  {exec.vulnerabilityScore >= 70 && (
                    <Badge variant="destructive" className="mt-1">
                      High vulnerability: {exec.vulnerabilityScore}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CompanyForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        company={company}
      />

      <ExecutiveForm
        open={isExecutiveFormOpen}
        onOpenChange={setIsExecutiveFormOpen}
        companyId={company.id}
      />
    </div>
  );
}