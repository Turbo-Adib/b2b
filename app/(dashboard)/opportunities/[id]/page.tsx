'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  Building2,
  FileText,
  AlertTriangle,
  Edit,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  async function fetchOpportunity() {
    try {
      const response = await fetch(`/api/opportunities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data.opportunity);
      } else {
        console.error('Failed to fetch opportunity');
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading opportunity details...</div>;
  }

  if (!opportunity) {
    return <div className="text-center py-8">Opportunity not found</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/opportunities')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <p className="text-muted-foreground">
              {opportunity.regulationType} • {opportunity.regulationReference || 'No reference'}
            </p>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Opportunity
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold p-2 rounded-md text-center ${getScoreColor(opportunity.opportunityScore)}`}>
              {opportunity.opportunityScore}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lead Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {opportunity.leadTimeMonths || '-'} months
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-lg py-1 px-3">
              {opportunity.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg py-1 px-3">
              {opportunity.priority}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Description</h4>
            <p className="text-muted-foreground">{opportunity.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Implementation Date</h4>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {opportunity.implementationDate 
                  ? format(new Date(opportunity.implementationDate), 'PPP')
                  : 'Not set'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Deadline</h4>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {opportunity.deadlineDate 
                  ? format(new Date(opportunity.deadlineDate), 'PPP')
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Revenue Potential</h4>
              <Badge variant="secondary">{opportunity.revenuePotential}</Badge>
            </div>
            <div>
              <h4 className="font-medium mb-1">Competition Level</h4>
              <Badge variant="secondary">{opportunity.competitionLevel}</Badge>
            </div>
          </div>

          {opportunity.targetIndustries?.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Target Industries</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.targetIndustries.map((industry: string) => (
                  <Badge key={industry} variant="outline">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {opportunity.affectedCountries?.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Affected Countries</h4>
              <div className="flex flex-wrap gap-2">
                {opportunity.affectedCountries.map((country: string) => (
                  <Badge key={country} variant="outline">
                    {country}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {opportunity.complianceRequirements && (
            <div>
              <h4 className="font-medium mb-1">Compliance Requirements</h4>
              <p className="text-muted-foreground">{opportunity.complianceRequirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="competitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitors">
            Competitors ({opportunity.competitors?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({opportunity.governmentContacts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({opportunity.documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({opportunity.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({opportunity.researchTasks?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Activity</CardTitle>
              <CardDescription>
                Track competitor movements in this regulatory space
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.competitors?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No competitor activity tracked yet
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunity.competitors?.map((competitor: any) => (
                    <div key={competitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{competitor.competitorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {competitor.activityType} • {format(new Date(competitor.activityDate), 'PPP')}
                        </p>
                        <p className="text-sm mt-1">{competitor.description}</p>
                      </div>
                      <Badge variant={competitor.threatLevel === 'HIGH' || competitor.threatLevel === 'CRITICAL' ? 'destructive' : 'outline'}>
                        {competitor.threatLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Government Contacts</CardTitle>
              <CardDescription>
                Key stakeholders and decision makers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.governmentContacts?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No government contacts added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunity.governmentContacts?.map((contact: any) => (
                    <div key={contact.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.title} • {contact.department}
                          </p>
                          <p className="text-sm">{contact.role}</p>
                        </div>
                        <Badge variant="outline">
                          {contact.influence}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Related documents and resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.documents?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No documents uploaded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunity.documents?.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {format(new Date(doc.createdAt), 'PPP')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Research Notes</CardTitle>
              <CardDescription>
                Notes and insights about this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.notes?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No notes added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunity.notes?.map((note: any) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{note.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {format(new Date(note.createdAt), 'PPP')}
                      </p>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Research Tasks</CardTitle>
              <CardDescription>
                Tasks and action items for this opportunity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunity.researchTasks?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No research tasks created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {opportunity.researchTasks?.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.dueDate), 'PPP')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'destructive' : 'outline'}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {opportunity.alerts?.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts</AlertTitle>
          <AlertDescription>
            You have {opportunity.alerts.length} unread alerts for this opportunity
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}