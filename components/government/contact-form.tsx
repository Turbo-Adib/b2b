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

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
  opportunityId?: string;
}

const ROLES = [
  'Implementation Lead',
  'Policy Maker',
  'Tender Authority',
  'Technical Expert',
  'Legal Advisor',
  'Department Head',
  'Project Manager',
  'Procurement Officer',
  'Other',
];

export function ContactForm({ 
  open, 
  onOpenChange, 
  contact, 
  opportunityId 
}: ContactFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const isEdit = !!contact;

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
      name: formData.get('name'),
      title: formData.get('title'),
      department: formData.get('department'),
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      linkedinUrl: formData.get('linkedinUrl') || undefined,
      role: formData.get('role'),
      influence: formData.get('influence'),
      notes: formData.get('notes') || undefined,
      opportunityId: opportunityId || formData.get('opportunityId') || undefined,
    };

    try {
      const url = isEdit
        ? `/api/government-contacts/${contact.id}`
        : '/api/government-contacts';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contact');
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
              {isEdit ? 'Edit Government Contact' : 'Add Government Contact'}
            </DialogTitle>
            <DialogDescription>
              Track key stakeholders and decision makers
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
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={contact?.name}
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
                  defaultValue={contact?.title}
                  placeholder="Director of Digital Policy"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department*</Label>
              <Input
                id="department"
                name="department"
                defaultValue={contact?.department}
                placeholder="e.g., DG CNECT, Ministry of Digital Affairs"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role*</Label>
                <Select
                  name="role"
                  defaultValue={contact?.role}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="influence">Influence Level*</Label>
                <Select
                  name="influence"
                  defaultValue={contact?.influence || 'MEDIUM'}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select influence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="KEY_DECISION_MAKER">Key Decision Maker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={contact?.email}
                  placeholder="john.smith@ec.europa.eu"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={contact?.phone}
                  placeholder="+32 2 299 1111"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                defaultValue={contact?.linkedinUrl}
                placeholder="https://linkedin.com/in/..."
                disabled={isLoading}
              />
            </div>

            {!opportunityId && (
              <div className="space-y-2">
                <Label htmlFor="opportunityId">Related Opportunity</Label>
                <Select
                  name="opportunityId"
                  defaultValue={contact?.opportunityId}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={contact?.notes}
                rows={3}
                placeholder="Additional context, meeting notes, or relationship details"
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
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}