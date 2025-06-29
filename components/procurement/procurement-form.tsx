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

interface ProcurementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procurement?: any;
}

const REGIONS = [
  'EU',
  'US',
  'UK',
  'Singapore',
  'UAE',
  'Germany',
  'France',
  'Netherlands',
  'Belgium',
  'Other',
];

const CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'SGD',
  'AED',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
];

export function ProcurementForm({ open, onOpenChange, procurement }: ProcurementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!procurement;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      procurementNumber: formData.get('procurementNumber') || undefined,
      region: formData.get('region'),
      issuingAuthority: formData.get('issuingAuthority'),
      publishDate: formData.get('publishDate') || new Date().toISOString(),
      submissionDeadline: formData.get('submissionDeadline') || undefined,
      estimatedValue: formData.get('estimatedValue') ? parseFloat(formData.get('estimatedValue') as string) : undefined,
      currency: formData.get('currency') || undefined,
      status: formData.get('status'),
      serviceGap: formData.get('serviceGap') === 'on',
      bottleneck: formData.get('bottleneck') === 'on',
      gapAnalysis: formData.get('gapAnalysis') || undefined,
      winProbability: formData.get('winProbability') ? parseFloat(formData.get('winProbability') as string) : undefined,
    };

    try {
      const url = isEdit
        ? `/api/procurement/${procurement.id}`
        : '/api/procurement';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save procurement');
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
              {isEdit ? 'Edit Procurement' : 'Track Procurement Opportunity'}
            </DialogTitle>
            <DialogDescription>
              Monitor government tenders and identify service gaps
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                name="title"
                defaultValue={procurement?.title}
                placeholder="e.g., AI Act Compliance Audit Services"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={procurement?.description}
                rows={3}
                placeholder="Describe the procurement opportunity and requirements"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procurementNumber">Procurement Number</Label>
                <Input
                  id="procurementNumber"
                  name="procurementNumber"
                  defaultValue={procurement?.procurementNumber}
                  placeholder="e.g., TED-2024-123456"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region*</Label>
                <Select
                  name="region"
                  defaultValue={procurement?.region}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuingAuthority">Issuing Authority*</Label>
              <Input
                id="issuingAuthority"
                name="issuingAuthority"
                defaultValue={procurement?.issuingAuthority}
                placeholder="e.g., European Commission DG CNECT"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date*</Label>
                <Input
                  id="publishDate"
                  name="publishDate"
                  type="datetime-local"
                  defaultValue={procurement?.publishDate?.slice(0, 16) || new Date().toISOString().slice(0, 16)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                <Input
                  id="submissionDeadline"
                  name="submissionDeadline"
                  type="datetime-local"
                  defaultValue={procurement?.submissionDeadline?.slice(0, 16)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value</Label>
                <Input
                  id="estimatedValue"
                  name="estimatedValue"
                  type="number"
                  step="0.01"
                  defaultValue={procurement?.estimatedValue}
                  placeholder="1000000"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  name="currency"
                  defaultValue={procurement?.currency || 'EUR'}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  name="status"
                  defaultValue={procurement?.status || 'OPEN'}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="AWARDED">Awarded</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="serviceGap"
                  name="serviceGap"
                  defaultChecked={procurement?.serviceGap}
                  disabled={isLoading}
                />
                <Label htmlFor="serviceGap" className="font-normal">
                  Service Gap Identified (No clear incumbent or solution)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bottleneck"
                  name="bottleneck"
                  defaultChecked={procurement?.bottleneck}
                  disabled={isLoading}
                />
                <Label htmlFor="bottleneck" className="font-normal">
                  Bottleneck Identified (Institutional pain point)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gapAnalysis">Gap Analysis</Label>
              <Textarea
                id="gapAnalysis"
                name="gapAnalysis"
                defaultValue={procurement?.gapAnalysis}
                rows={3}
                placeholder="Describe the service gap or bottleneck opportunity"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="winProbability">Win Probability (%)</Label>
              <Input
                id="winProbability"
                name="winProbability"
                type="number"
                min="0"
                max="100"
                defaultValue={procurement?.winProbability}
                placeholder="75"
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Track Procurement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}