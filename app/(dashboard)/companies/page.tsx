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
import { Plus, Search, TrendingUp, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { CompanyList } from '@/components/companies/company-list';
import { CompanyForm } from '@/components/companies/company-form';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({
    pressure: 'all',
    gtmGap: 'all',
    days: '90',
    search: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  async function fetchCompanies() {
    try {
      const params = new URLSearchParams();
      if (filters.pressure !== 'all') params.append('pressure', filters.pressure);
      if (filters.gtmGap === 'true') params.append('gtmGap', 'true');
      if (filters.days !== 'all') params.append('days', filters.days);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();
      
      setCompanies(data.companies || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(company: any) {
    setEditingCompany(company);
    setIsFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    if (!open) {
      setEditingCompany(null);
    }
    setIsFormOpen(open);
  }

  const highPressureCompanies = companies.filter(c => c.pressureScore >= 70);
  const gtmGapCompanies = companies.filter(c => c.gtmGapDetected);
  const recentlyFunded = companies.filter(c => {
    if (!c.lastFundingDate) return false;
    const daysSinceFunding = Math.floor((Date.now() - new Date(c.lastFundingDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceFunding <= 90;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Private Market Intelligence</h1>
          <p className="text-muted-foreground">
            Track funding pressure and executive vulnerability
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Track Company
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
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
            <CardTitle className="text-sm font-medium">High Pressure</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPressure || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score ≥70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GTM Gaps</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gtmGaps || 0}</div>
            <p className="text-xs text-muted-foreground">
              No sales/growth hires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Funding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withRecentFunding || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((stats.totalFunding || 0) / 1000000000).toFixed(1)}B
            </div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.pressure}
          onValueChange={(value) => setFilters({ ...filters, pressure: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Pressure Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pressure Levels</SelectItem>
            <SelectItem value="high">High (≥70%)</SelectItem>
            <SelectItem value="medium">Medium (40-69%)</SelectItem>
            <SelectItem value="low">Low (&lt;40%)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.days}
          onValueChange={(value) => setFilters({ ...filters, days: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Funding Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({companies.length})
          </TabsTrigger>
          <TabsTrigger value="high-pressure">
            High Pressure ({highPressureCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="gtm-gaps">
            GTM Gaps ({gtmGapCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="recent-funding">
            Recent Funding ({recentlyFunded.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading companies...</div>
          ) : (
            <CompanyList
              companies={companies}
              onEdit={handleEdit}
              onRefresh={fetchCompanies}
            />
          )}
        </TabsContent>

        <TabsContent value="high-pressure" className="space-y-4">
          {highPressureCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No high pressure companies detected
            </div>
          ) : (
            <CompanyList
              companies={highPressureCompanies}
              onEdit={handleEdit}
              onRefresh={fetchCompanies}
            />
          )}
        </TabsContent>

        <TabsContent value="gtm-gaps" className="space-y-4">
          {gtmGapCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No GTM gaps detected
            </div>
          ) : (
            <CompanyList
              companies={gtmGapCompanies}
              onEdit={handleEdit}
              onRefresh={fetchCompanies}
            />
          )}
        </TabsContent>

        <TabsContent value="recent-funding" className="space-y-4">
          {recentlyFunded.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recently funded companies
            </div>
          ) : (
            <CompanyList
              companies={recentlyFunded}
              onEdit={handleEdit}
              onRefresh={fetchCompanies}
            />
          )}
        </TabsContent>
      </Tabs>

      <CompanyForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        company={editingCompany}
      />
    </div>
  );
}