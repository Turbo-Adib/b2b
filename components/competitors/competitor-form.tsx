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

interface CompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor?: any;
  opportunityId?: string;
}

const ACTIVITY_TYPES = [
  'LinkedIn Post',
  'Conference Speaker',
  'Tender Application',
  'Service Announcement',
  'Partnership Announcement',
  'Thought Leadership',
  'Media Interview',
  'Government Meeting',
  'Other',
];

export function CompetitorForm({ 
  open, 
  onOpenChange, 
  competitor, 
  opportunityId 
}: CompetitorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const isEdit = !!competitor;

  useEffect(() => {
    if (open && !opportunityId) {
      fetchOpportunities();
    }
  }, [open]);

  async function fetchOpportunities() {
    try {
      const response = await fetch('/api/opportunities?status=ACTIVE');
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      opportunityId: opportunityId || formData.get('opportunityId'),
      competitorName: formData.get('competitorName'),
      activityType: formData.get('activityType'),
      activityDate: formData.get('activityDate') || new Date().toISOString(),
      description: formData.get('description'),
      sourceUrl: formData.get('sourceUrl') || undefined,
      threatLevel: formData.get('threatLevel'),
    };

    try {
      const url = isEdit
        ? `/api/competitors/${competitor.id}`
        : '/api/competitors';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save competitor activity');
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Competitor Activity' : 'Track Competitor Activity'}
            </DialogTitle>
            <DialogDescription>
              Record competitor movements in the regulatory space
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!opportunityId && (
              <div className="space-y-2">
                <Label htmlFor="opportunityId">Opportunity*</Label>
                <Select
                  name="opportunityId"
                  defaultValue={competitor?.opportunityId}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunities.map((opp) => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="competitorName">Competitor Name*</Label>
              <Input
                id="competitorName"
                name="competitorName"
                defaultValue={competitor?.competitorName}
                placeholder="e.g., McKinsey, Deloitte, etc."
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type*</Label>
                <Select
                  name="activityType"
                  defaultValue={competitor?.activityType}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threatLevel">Threat Level*</Label>
                <Select
                  name="threatLevel"
                  defaultValue={competitor?.threatLevel || 'LOW'}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityDate">Activity Date*</Label>
              <Input
                id="activityDate"
                name="activityDate"
                type="datetime-local"
                defaultValue={competitor?.activityDate?.slice(0, 16) || new Date().toISOString().slice(0, 16)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={competitor?.description}
                rows={3}
                placeholder="Describe the competitor activity and its implications"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                defaultValue={competitor?.sourceUrl}
                placeholder="https://..."
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Track Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}