'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface ExecutiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  executive?: any;
  companyId?: string;
}

const RISK_FACTORS = [
  { value: 'pipeline_pressure', label: 'Pipeline pressure (KPIs not met)' },
  { value: 'ad_spend_waste', label: 'Ad spend without conversion' },
  { value: 'board_pressure', label: 'Board pressure/demands' },
  { value: 'no_gtm_team', label: 'No proper GTM team' },
  { value: 'founder_led_sales', label: 'Founder-led sales not scaling' },
  { value: 'recent_hire', label: 'Recently hired (<6 months)' },
  { value: 'public_criticism', label: 'Public criticism/pressure' },
];

const DESPERATION_SIGNALS = [
  { value: 'hiring_rockstars', label: 'Posting about hiring "rockstars"' },
  { value: 'culture_posts', label: 'Excessive culture/vision posts' },
  { value: 'thought_leadership', label: 'Sudden thought leadership push' },
  { value: 'urgent_hiring', label: 'Urgent hiring posts' },
  { value: 'defensive_posts', label: 'Defensive public statements' },
];

const OPPORTUNITY_TYPES = [
  'Reputation Insurance',
  'Quick Wins (45-60 days)',
  'Crisis Prevention',
  'Interim Executive',
  'Board Optics Management',
  'Scale Enablement',
];

export function ExecutiveForm({ 
  open, 
  onOpenChange, 
  executive, 
  companyId 
}: ExecutiveFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedRiskFactors, setSelectedRiskFactors] = useState<string[]>(
    executive?.riskFactors || []
  );
  const [selectedSignals, setSelectedSignals] = useState<string[]>(
    executive?.desperationSignals || []
  );

  const isEdit = !!executive;

  useEffect(() => {
    if (open && !companyId) {
      fetchCompanies();
    }
  }, [open]);

  async function fetchCompanies() {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      companyId: companyId || formData.get('companyId'),
      name: formData.get('name'),
      title: formData.get('title'),
      linkedinUrl: formData.get('linkedinUrl') || undefined,
      email: formData.get('email') || undefined,
      riskFactors: selectedRiskFactors,
      desperationSignals: selectedSignals,
      lastLinkedinPost: formData.get('lastLinkedinPost') || undefined,
      notes: formData.get('notes') || undefined,
      opportunityType: formData.get('opportunityType') || undefined,
    };

    try {
      const url = isEdit
        ? `/api/executives/${executive.id}`
        : '/api/executives';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save executive');
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Executive' : 'Track Executive'}
            </DialogTitle>
            <DialogDescription>
              Monitor executive vulnerability and pressure signals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!companyId && (
              <div className="space-y-2">
                <Label htmlFor="companyId">Company*</Label>
                <Select
                  name="companyId"
                  defaultValue={executive?.companyId}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={executive?.name}
                  placeholder="John Smith"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={executive?.title}
                  placeholder="CMO, CRO, VP Sales, etc."
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={executive?.email}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  defaultValue={executive?.linkedinUrl}
                  placeholder="https://linkedin.com/in/..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Risk Factors</Label>
              <div className="space-y-2">
                {RISK_FACTORS.map((factor) => (
                  <div key={factor.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor.value}
                      checked={selectedRiskFactors.includes(factor.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRiskFactors([...selectedRiskFactors, factor.value]);
                        } else {
                          setSelectedRiskFactors(
                            selectedRiskFactors.filter(f => f !== factor.value)
                          );
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Label htmlFor={factor.value} className="font-normal">
                      {factor.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Desperation Signals</Label>
              <div className="space-y-2">
                {DESPERATION_SIGNALS.map((signal) => (
                  <div key={signal.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={signal.value}
                      checked={selectedSignals.includes(signal.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSignals([...selectedSignals, signal.value]);
                        } else {
                          setSelectedSignals(
                            selectedSignals.filter(s => s !== signal.value)
                          );
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Label htmlFor={signal.value} className="font-normal">
                      {signal.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastLinkedinPost">Last LinkedIn Post Date</Label>
              <Input
                id="lastLinkedinPost"
                name="lastLinkedinPost"
                type="datetime-local"
                defaultValue={executive?.lastLinkedinPost?.slice(0, 16)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunityType">Opportunity Type</Label>
              <Select
                name="opportunityType"
                defaultValue={executive?.opportunityType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity type" />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={executive?.notes}
                rows={3}
                placeholder="Additional context, observations, or strategy notes"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Track Executive'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}