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
import { Plus, Search, Filter } from 'lucide-react';
import { OpportunityList } from '@/components/opportunities/opportunity-list';
import { OpportunityForm } from '@/components/opportunities/opportunity-form';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  async function fetchOpportunities() {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);

      const response = await fetch(`/api/opportunities?${params}`);
      const data = await response.json();
      
      let filteredOpportunities = data.opportunities || [];
      
      // Client-side search filter
      if (filters.search) {
        filteredOpportunities = filteredOpportunities.filter((opp: any) =>
          opp.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          opp.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setOpportunities(filteredOpportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(opportunity: any) {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    if (!open) {
      setEditingOpportunity(null);
    }
    setIsFormOpen(open);
  }

  const activeOpportunities = opportunities.filter((opp: any) => 
    ['IDENTIFIED', 'RESEARCHING', 'POSITIONING', 'PURSUING'].includes(opp.status)
  );
  const wonOpportunities = opportunities.filter((opp: any) => opp.status === 'WON');
  const lostOpportunities = opportunities.filter((opp: any) => opp.status === 'LOST');
  const archivedOpportunities = opportunities.filter((opp: any) => opp.status === 'ARCHIVED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage regulatory opportunities
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Opportunity
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="IDENTIFIED">Identified</SelectItem>
            <SelectItem value="RESEARCHING">Researching</SelectItem>
            <SelectItem value="POSITIONING">Positioning</SelectItem>
            <SelectItem value="PURSUING">Pursuing</SelectItem>
            <SelectItem value="WON">Won</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.priority}
          onValueChange={(value) => setFilters({ ...filters, priority: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="won">
            Won ({wonOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="lost">
            Lost ({lostOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({opportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading opportunities...</div>
          ) : (
            <OpportunityList
              opportunities={activeOpportunities}
              onEdit={handleEdit}
              onRefresh={fetchOpportunities}
            />
          )}
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          <OpportunityList
            opportunities={wonOpportunities}
            onEdit={handleEdit}
            onRefresh={fetchOpportunities}
          />
        </TabsContent>

        <TabsContent value="lost" className="space-y-4">
          <OpportunityList
            opportunities={lostOpportunities}
            onEdit={handleEdit}
            onRefresh={fetchOpportunities}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <OpportunityList
            opportunities={archivedOpportunities}
            onEdit={handleEdit}
            onRefresh={fetchOpportunities}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <OpportunityList
            opportunities={opportunities}
            onEdit={handleEdit}
            onRefresh={fetchOpportunities}
          />
        </TabsContent>
      </Tabs>

      <OpportunityForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        opportunity={editingOpportunity}
      />
    </div>
  );
}