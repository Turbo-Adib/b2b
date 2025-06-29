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
import { Plus, Search, TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { ProcurementList } from '@/components/procurement/procurement-list';
import { ProcurementForm } from '@/components/procurement/procurement-form';
import { ContactList } from '@/components/government/contact-list';
import { ContactForm } from '@/components/government/contact-form';

export default function ProcurementPage() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [regionSummary, setRegionSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcurementFormOpen, setIsProcurementFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingProcurement, setEditingProcurement] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [filters, setFilters] = useState({
    region: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  async function fetchData() {
    await Promise.all([fetchProcurements(), fetchContacts()]);
  }

  async function fetchProcurements() {
    try {
      const params = new URLSearchParams();
      if (filters.region !== 'all') params.append('region', filters.region);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await fetch(`/api/procurement?${params}`);
      const data = await response.json();
      
      let filteredProcurements = data.procurements || [];
      
      // Client-side search
      if (filters.search) {
        filteredProcurements = filteredProcurements.filter((proc: any) =>
          proc.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          proc.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          proc.issuingAuthority.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setProcurements(filteredProcurements);
      setStats(data.stats || {});
      setRegionSummary(data.regionSummary || []);
    } catch (error) {
      console.error('Error fetching procurements:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchContacts() {
    try {
      const response = await fetch('/api/government-contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  function handleEditProcurement(procurement: any) {
    setEditingProcurement(procurement);
    setIsProcurementFormOpen(true);
  }

  function handleEditContact(contact: any) {
    setEditingContact(contact);
    setIsContactFormOpen(true);
  }

  function handleProcurementFormClose(open: boolean) {
    if (!open) {
      setEditingProcurement(null);
    }
    setIsProcurementFormOpen(open);
  }

  function handleContactFormClose(open: boolean) {
    if (!open) {
      setEditingContact(null);
    }
    setIsContactFormOpen(open);
  }

  const openProcurements = procurements.filter(p => p.status === 'OPEN');
  const serviceGaps = procurements.filter(p => p.serviceGap);
  const bottlenecks = procurements.filter(p => p.bottleneck);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government Signal Tracking</h1>
          <p className="text-muted-foreground">
            Monitor procurement opportunities and identify service gaps
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.open || 0} open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{((stats.totalValue || 0) / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Gaps</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.serviceGaps || 0}</div>
            <p className="text-xs text-muted-foreground">
              High-leverage opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bottlenecks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pain points identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeadlines || 0}</div>
            <p className="text-xs text-muted-foreground">
              Due within 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search procurements..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.region}
          onValueChange={(value) => setFilters({ ...filters, region: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="EU">EU</SelectItem>
            <SelectItem value="US">US</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Singapore">Singapore</SelectItem>
            <SelectItem value="UAE">UAE</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="AWARDED">Awarded</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setIsProcurementFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Track Tender
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({procurements.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({openProcurements.length})
          </TabsTrigger>
          <TabsTrigger value="gaps">
            Service Gaps ({serviceGaps.length})
          </TabsTrigger>
          <TabsTrigger value="bottlenecks">
            Bottlenecks ({bottlenecks.length})
          </TabsTrigger>
          <TabsTrigger value="regions">
            By Region
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({contacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading procurements...</div>
          ) : (
            <ProcurementList
              procurements={procurements}
              onEdit={handleEditProcurement}
              onRefresh={fetchProcurements}
            />
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <ProcurementList
            procurements={openProcurements}
            onEdit={handleEditProcurement}
            onRefresh={fetchProcurements}
          />
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          {serviceGaps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No service gaps identified yet
            </div>
          ) : (
            <ProcurementList
              procurements={serviceGaps}
              onEdit={handleEditProcurement}
              onRefresh={fetchProcurements}
            />
          )}
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          {bottlenecks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bottlenecks identified yet
            </div>
          ) : (
            <ProcurementList
              procurements={bottlenecks}
              onEdit={handleEditProcurement}
              onRefresh={fetchProcurements}
            />
          )}
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regionSummary.map((region) => (
              <Card key={region.region}>
                <CardHeader>
                  <CardTitle>{region.region}</CardTitle>
                  <CardDescription>
                    {region.count} procurements • €{(region.value / 1000000).toFixed(1)}M
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Open tenders:</span>
                      <Badge variant="outline">{region.open}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Service gaps:</span>
                      <Badge variant="outline">{region.serviceGaps}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsContactFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
          <ContactList
            contacts={contacts}
            onEdit={handleEditContact}
          />
        </TabsContent>
      </Tabs>

      <ProcurementForm
        open={isProcurementFormOpen}
        onOpenChange={handleProcurementFormClose}
        procurement={editingProcurement}
      />

      <ContactForm
        open={isContactFormOpen}
        onOpenChange={handleContactFormClose}
        contact={editingContact}
      />
    </div>
  );
}