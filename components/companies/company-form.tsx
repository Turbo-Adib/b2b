'use client';

import { useState } from 'react';
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

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: any;
}

const INDUSTRIES = [
  'Technology',
  'SaaS',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Marketing',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Other',
];

const FUNDING_ROUNDS = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Private Equity',
  'IPO',
];

export function CompanyForm({ open, onOpenChange, company }: CompanyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!company;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      website: formData.get('website') || undefined,
      linkedinUrl: formData.get('linkedinUrl') || undefined,
      industry: formData.get('industry'),
      lastFundingRound: formData.get('lastFundingRound') || undefined,
      lastFundingAmount: formData.get('lastFundingAmount') 
        ? parseFloat(formData.get('lastFundingAmount') as string) 
        : undefined,
      lastFundingDate: formData.get('lastFundingDate') || undefined,
      totalFunding: formData.get('totalFunding')
        ? parseFloat(formData.get('totalFunding') as string)
        : undefined,
      gtmGapDetected: formData.get('gtmGapDetected') === 'on',
      executiveTurnover: formData.get('executiveTurnover') === 'on',
      analysisNotes: formData.get('analysisNotes') || undefined,
    };

    try {
      const url = isEdit
        ? `/api/companies/${company.id}`
        : '/api/companies';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save company');
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
              {isEdit ? 'Edit Company' : 'Track Company'}
            </DialogTitle>
            <DialogDescription>
              Monitor companies for funding pressure and executive vulnerability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name*</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={company?.name}
                  placeholder="Acme Corp"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry*</Label>
                <Select
                  name="industry"
                  defaultValue={company?.industry}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={company?.website}
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  defaultValue={company?.linkedinUrl}
                  placeholder="https://linkedin.com/company/..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Funding Information</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastFundingRound">Last Funding Round</Label>
                  <Select
                    name="lastFundingRound"
                    defaultValue={company?.lastFundingRound}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNDING_ROUNDS.map((round) => (
                        <SelectItem key={round} value={round}>
                          {round}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastFundingAmount">Last Funding Amount ($)</Label>
                  <Input
                    id="lastFundingAmount"
                    name="lastFundingAmount"
                    type="number"
                    step="1000000"
                    defaultValue={company?.lastFundingAmount}
                    placeholder="10000000"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastFundingDate">Last Funding Date</Label>
                  <Input
                    id="lastFundingDate"
                    name="lastFundingDate"
                    type="datetime-local"
                    defaultValue={company?.lastFundingDate?.slice(0, 16)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="totalFunding">Total Funding ($)</Label>
                <Input
                  id="totalFunding"
                  name="totalFunding"
                  type="number"
                  step="1000000"
                  defaultValue={company?.totalFunding}
                  placeholder="50000000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Pressure Indicators</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gtmGapDetected"
                    name="gtmGapDetected"
                    defaultChecked={company?.gtmGapDetected}
                    disabled={isLoading}
                  />
                  <Label htmlFor="gtmGapDetected" className="font-normal">
                    GTM Gap Detected (No recent growth/sales leadership hires)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="executiveTurnover"
                    name="executiveTurnover"
                    defaultChecked={company?.executiveTurnover}
                    disabled={isLoading}
                  />
                  <Label htmlFor="executiveTurnover" className="font-normal">
                    Executive Turnover (Recent departures or role changes)
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="analysisNotes">Analysis Notes</Label>
              <Textarea
                id="analysisNotes"
                name="analysisNotes"
                defaultValue={company?.analysisNotes}
                rows={3}
                placeholder="Internal observations, pressure points, opportunities..."
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Track Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}