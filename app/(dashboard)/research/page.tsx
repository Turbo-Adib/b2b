'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  FileText,
  Calendar,
  Building2,
  Users,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Target,
  Clock,
  CheckCircle2,
  Plus,
  Save,
  Download,
  Share2
} from 'lucide-react';
import { ResearchTaskList } from '@/components/research/research-task-list';
import { ResearchTaskForm } from '@/components/research/research-task-form';

export default function ResearchPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [researchNotes, setResearchNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch research tasks
      const tasksResponse = await fetch('/api/research-tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);

      // Fetch opportunities for research
      const oppsResponse = await fetch('/api/opportunities?status=researching');
      const oppsData = await oppsResponse.json();
      setOpportunities(oppsData.opportunities || []);

      if (oppsData.opportunities.length > 0) {
        setSelectedOpportunity(oppsData.opportunities[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveResearchNotes() {
    if (!selectedOpportunity) return;

    try {
      await fetch(`/api/opportunities/${selectedOpportunity.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: researchNotes }),
      });
      alert('Research notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading research workspace...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deep-Dive Research Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis workspace for regulatory opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Research
          </Button>
          <Button onClick={() => setIsTaskFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Research Task
          </Button>
        </div>
      </div>

      {/* Opportunity Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Opportunity for Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedOpportunity?.id || ''}
              onChange={(e) => {
                const opp = opportunities.find(o => o.id === e.target.value);
                setSelectedOpportunity(opp);
              }}
            >
              <option value="">Select an opportunity...</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} (Score: {opp.opportunityScore}%)
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => window.open(`/opportunities/${selectedOpportunity?.id}`, '_blank')}
              disabled={!selectedOpportunity}
            >
              <Target className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedOpportunity && (
        <>
          {/* Research Progress */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Research Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={taskProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} of {tasks.length} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time to Market</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {selectedOpportunity.leadTime || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">months lead time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    €{(selectedOpportunity.revenuePotential / 1000).toFixed(0)}k
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">estimated annual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Competition Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedOpportunity.competitionLevel === 'low' ? 'secondary' : 'default'}>
                    {selectedOpportunity.competitionLevel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedOpportunity.marketGap ? 'Market gap identified' : 'Established market'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Research Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="regulation">Regulation Analysis</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="market">Market Intel</TabsTrigger>
              <TabsTrigger value="contacts">Gov Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Overview</CardTitle>
                  <CardDescription>{selectedOpportunity.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOpportunity.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Target Market</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedOpportunity.targetMarket || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Regulatory Area</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedOpportunity.regulatoryArea || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Research Notes</h4>
                    <Textarea
                      value={researchNotes}
                      onChange={(e) => setResearchNotes(e.target.value)}
                      placeholder="Add your research findings, insights, and action items..."
                      rows={6}
                      className="mb-2"
                    />
                    <Button onClick={saveResearchNotes} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Research Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Tasks</CardTitle>
                  <CardDescription>
                    Track your research progress and action items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResearchTaskList
                    tasks={tasks.filter(t => t.opportunityId === selectedOpportunity.id)}
                    onUpdate={fetchData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regulation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Regulation Analysis</CardTitle>
                  <CardDescription>
                    Full text parsing and compliance requirements extraction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Compliance Requirements</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          Registration and licensing procedures
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          Reporting and documentation standards
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                          Technical specifications (requires further analysis)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Regulatory Sources</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          EUR-Lex Database
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          National Implementation Laws
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Timeline</CardTitle>
                  <CardDescription>
                    Critical dates, deadlines, and enforcement phases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Regulation Published</p>
                        <p className="text-sm text-muted-foreground">Q1 2024 - Official publication in EU Journal</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">National Transposition Deadline</p>
                        <p className="text-sm text-muted-foreground">Q3 2024 - Member states must implement</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <div className="w-0.5 h-16 bg-border" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Grace Period Ends</p>
                        <p className="text-sm text-muted-foreground">Q1 2025 - Full enforcement begins</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">First Audit Wave</p>
                        <p className="text-sm text-muted-foreground">Q2 2025 - Compliance checks begin</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Market Intelligence</CardTitle>
                  <CardDescription>
                    Existing players, service gaps, and pricing opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Competitor Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Big4 Consulting Firms</span>
                        <Badge variant="destructive">High presence</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Boutique Compliance Firms</span>
                        <Badge variant="default">Medium presence</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Legal Advisory</span>
                        <Badge variant="secondary">Low presence</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Service Gaps Identified</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Implementation roadmap consulting</li>
                      <li>• Automated compliance monitoring</li>
                      <li>• Training and certification programs</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Pricing Intelligence</h4>
                    <p className="text-sm text-muted-foreground">
                      Current market rates: €1,500-€3,000 per day for senior consultants
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Government Contact Mapping</CardTitle>
                  <CardDescription>
                    Key officials, implementation bodies, and tender authorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">DG Environment</h4>
                          <Badge>Primary Contact</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Lead implementation body for environmental regulations</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Brussels
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Policy Unit
                          </span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">National Competent Authority</h4>
                          <Badge variant="secondary">Secondary Contact</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Member state implementation oversight</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Multiple Locations
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Compliance Division
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Government Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <ResearchTaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        opportunityId={selectedOpportunity?.id}
      />
    </div>
  );
}