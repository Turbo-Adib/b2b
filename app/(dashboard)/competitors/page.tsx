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
import { Plus, Search, Calendar } from 'lucide-react';
import { CompetitorActivityList } from '@/components/competitors/competitor-activity-list';
import { CompetitorSummary } from '@/components/competitors/competitor-summary';
import { CompetitorForm } from '@/components/competitors/competitor-form';

export default function CompetitorsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filters, setFilters] = useState({
    threatLevel: 'all',
    competitorName: '',
    days: '30',
  });

  useEffect(() => {
    fetchCompetitors();
  }, [filters]);

  async function fetchCompetitors() {
    try {
      const params = new URLSearchParams();
      if (filters.threatLevel !== 'all') params.append('threatLevel', filters.threatLevel);
      if (filters.competitorName) params.append('competitorName', filters.competitorName);
      if (filters.days !== 'all') params.append('days', filters.days);

      const response = await fetch(`/api/competitors?${params}`);
      const data = await response.json();
      
      setActivities(data.activities || []);
      setSummary(data.summary || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(activity: any) {
    setEditingActivity(activity);
    setIsFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    if (!open) {
      setEditingActivity(null);
    }
    setIsFormOpen(open);
  }

  // Filter activities by threat level for tabs
  const highThreatActivities = activities.filter(a => 
    a.threatLevel === 'HIGH' || a.threatLevel === 'CRITICAL'
  );
  const recentActivities = activities.slice(0, 20); // Most recent 20

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitor Intelligence</h1>
          <p className="text-muted-foreground">
            Track competitor movements in your regulatory spaces
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Track Activity
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search competitor names..."
            value={filters.competitorName}
            onChange={(e) => setFilters({ ...filters, competitorName: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.threatLevel}
          onValueChange={(value) => setFilters({ ...filters, threatLevel: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Threat Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Threat Levels</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.days}
          onValueChange={(value) => setFilters({ ...filters, days: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline ({activities.length})
          </TabsTrigger>
          <TabsTrigger value="high-threat">
            High Threat ({highThreatActivities.length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading competitor intelligence...</div>
          ) : summary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No competitor activity tracked yet. Start by tracking competitor movements.
            </div>
          ) : (
            <CompetitorSummary summary={summary} />
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <CompetitorActivityList
            activities={activities}
            onEdit={handleEdit}
            onRefresh={fetchCompetitors}
          />
        </TabsContent>

        <TabsContent value="high-threat" className="space-y-4">
          {highThreatActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No high threat activities detected
            </div>
          ) : (
            <CompetitorActivityList
              activities={highThreatActivities}
              onEdit={handleEdit}
              onRefresh={fetchCompetitors}
            />
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <CompetitorActivityList
            activities={recentActivities}
            onEdit={handleEdit}
            onRefresh={fetchCompetitors}
          />
        </TabsContent>
      </Tabs>

      <CompetitorForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        competitor={editingActivity}
      />
    </div>
  );
}