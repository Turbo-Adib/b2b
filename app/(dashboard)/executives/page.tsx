'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertTriangle, Target, Users } from 'lucide-react';
import { ExecutiveList } from '@/components/executives/executive-list';
import { ExecutiveForm } from '@/components/executives/executive-form';

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [filters, setFilters] = useState({
    vulnerability: 'all',
    title: 'all',
  });

  useEffect(() => {
    fetchExecutives();
  }, [filters]);

  async function fetchExecutives() {
    try {
      const params = new URLSearchParams();
      if (filters.vulnerability !== 'all') params.append('vulnerability', filters.vulnerability);
      if (filters.title !== 'all') params.append('title', filters.title);

      const response = await fetch(`/api/executives?${params}`);
      const data = await response.json();
      
      setExecutives(data.executives || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching executives:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(executive: any) {
    setEditingExecutive(executive);
    setIsFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    if (!open) {
      setEditingExecutive(null);
    }
    setIsFormOpen(open);
  }

  const highVulnerabilityExecs = executives.filter(e => e.vulnerabilityScore >= 70);
  const withDesperationSignals = executives.filter(e => e.desperationSignals.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executive Vulnerability Profiler</h1>
          <p className="text-muted-foreground">
            Map political danger zones within pressure-cooker companies
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Track Executive
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Vulnerability</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highVulnerability || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desperation Signals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withDesperationSignals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Showing pressure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Title Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(stats.titleDistribution || {})
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 3)
                .map(([title, count]: any) => (
                  <div key={title} className="flex items-center justify-between text-xs">
                    <span>{title}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Factors */}
      {stats.topRiskFactors && stats.topRiskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Common Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topRiskFactors.map(([factor, count]: any) => (
                <Badge key={factor} variant="secondary">
                  {factor.replace(/_/g, ' ')} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Select
          value={filters.vulnerability}
          onValueChange={(value) => setFilters({ ...filters, vulnerability: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Vulnerability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vulnerability</SelectItem>
            <SelectItem value="high">High (≥70%)</SelectItem>
            <SelectItem value="medium">Medium (40-69%)</SelectItem>
            <SelectItem value="low">Low (&lt;40%)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.title}
          onValueChange={(value) => setFilters({ ...filters, title: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Titles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Titles</SelectItem>
            <SelectItem value="CEO">CEO</SelectItem>
            <SelectItem value="CMO">CMO</SelectItem>
            <SelectItem value="CRO">CRO</SelectItem>
            <SelectItem value="VP">VP Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({executives.length})
          </TabsTrigger>
          <TabsTrigger value="high-vulnerability">
            High Vulnerability ({highVulnerabilityExecs.length})
          </TabsTrigger>
          <TabsTrigger value="desperation">
            Desperation Signals ({withDesperationSignals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading executives...</div>
          ) : (
            <ExecutiveList
              executives={executives}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="high-vulnerability" className="space-y-4">
          {highVulnerabilityExecs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No high vulnerability executives detected
            </div>
          ) : (
            <ExecutiveList
              executives={highVulnerabilityExecs}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="desperation" className="space-y-4">
          {withDesperationSignals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No desperation signals detected
            </div>
          ) : (
            <ExecutiveList
              executives={withDesperationSignals}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>
      </Tabs>

      <ExecutiveForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        executive={editingExecutive}
      />
    </div>
  );
}