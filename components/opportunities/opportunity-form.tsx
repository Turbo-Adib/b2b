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

interface OpportunityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: any;
}

const REGULATION_TYPES = [
  'Regulation',
  'Directive',
  'Implementing Act',
  'Delegated Act',
  'Decision',
  'Recommendation',
];

const LEGISLATIVE_STAGES = [
  'Proposal',
  'First Reading',
  'Second Reading',
  'Final Reading',
  'Council Adoption',
  'Parliament Approval',
  'Published',
  'In Force',
];

export function OpportunityForm({ open, onOpenChange, opportunity }: OpportunityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!opportunity;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      regulationType: formData.get('regulationType'),
      regulationReference: formData.get('regulationReference') || undefined,
      legislativeStage: formData.get('legislativeStage') || undefined,
      implementationDate: formData.get('implementationDate') || undefined,
      deadlineDate: formData.get('deadlineDate') || undefined,
      targetIndustries: formData.get('targetIndustries')
        ? (formData.get('targetIndustries') as string).split(',').map(s => s.trim())
        : [],
      affectedCountries: formData.get('affectedCountries')
        ? (formData.get('affectedCountries') as string).split(',').map(s => s.trim())
        : [],
      complianceRequirements: formData.get('complianceRequirements') || undefined,
    };

    try {
      const url = isEdit
        ? `/api/opportunities/${opportunity.id}`
        : '/api/opportunities';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save opportunity');
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Opportunity' : 'New Opportunity'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the opportunity details'
                : 'Add a new regulatory opportunity to track'}
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
                defaultValue={opportunity?.title}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={opportunity?.description}
                rows={3}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regulationType">Regulation Type*</Label>
                <Select
                  name="regulationType"
                  defaultValue={opportunity?.regulationType}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGULATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regulationReference">Reference Number</Label>
                <Input
                  id="regulationReference"
                  name="regulationReference"
                  defaultValue={opportunity?.regulationReference}
                  placeholder="e.g., 2024/123/EU"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legislativeStage">Legislative Stage</Label>
                <Select
                  name="legislativeStage"
                  defaultValue={opportunity?.legislativeStage}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEGISLATIVE_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="implementationDate">Implementation Date</Label>
                <Input
                  id="implementationDate"
                  name="implementationDate"
                  type="datetime-local"
                  defaultValue={opportunity?.implementationDate?.slice(0, 16)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadlineDate">Deadline Date</Label>
              <Input
                id="deadlineDate"
                name="deadlineDate"
                type="datetime-local"
                defaultValue={opportunity?.deadlineDate?.slice(0, 16)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetIndustries">Target Industries</Label>
              <Input
                id="targetIndustries"
                name="targetIndustries"
                defaultValue={opportunity?.targetIndustries?.join(', ')}
                placeholder="e.g., Finance, Healthcare, Technology"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of industries
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affectedCountries">Affected Countries</Label>
              <Input
                id="affectedCountries"
                name="affectedCountries"
                defaultValue={opportunity?.affectedCountries?.join(', ')}
                placeholder="e.g., DE, FR, IT"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of country codes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceRequirements">
                Compliance Requirements
              </Label>
              <Textarea
                id="complianceRequirements"
                name="complianceRequirements"
                defaultValue={opportunity?.complianceRequirements}
                rows={3}
                placeholder="Key compliance requirements and obligations"
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}