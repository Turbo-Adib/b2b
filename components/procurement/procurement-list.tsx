'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Calendar,
  Building2,
  AlertTriangle,
  TrendingUp,
  Edit,
  Trash,
  FileText,
  Users,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Procurement {
  id: string;
  title: string;
  description: string;
  procurementNumber?: string;
  region: string;
  issuingAuthority: string;
  publishDate: string;
  submissionDeadline?: string;
  estimatedValue?: number;
  currency?: string;
  status: string;
  serviceGap: boolean;
  bottleneck: boolean;
  winProbability?: number;
  contacts: any[];
  documents: any[];
}

interface ProcurementListProps {
  procurements: Procurement[];
  onEdit?: (procurement: Procurement) => void;
  onRefresh: () => void;
}

const STATUS_COLORS = {
  UPCOMING: 'secondary',
  OPEN: 'default',
  CLOSED: 'outline',
  AWARDED: 'default',
  CANCELLED: 'destructive',
} as const;

export function ProcurementList({ procurements, onEdit, onRefresh }: ProcurementListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this procurement?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/procurement/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete procurement');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting procurement:', error);
      alert('Failed to delete procurement');
    } finally {
      setDeletingId(null);
    }
  }

  function formatValue(value?: number, currency?: string) {
    if (!value) return null;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  }

  function getDaysUntilDeadline(deadline?: string) {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  }

  if (procurements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No procurements tracked yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {procurements.map((procurement) => {
        const daysUntilDeadline = getDaysUntilDeadline(procurement.submissionDeadline);
        const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
        
        return (
          <Card key={procurement.id} className={isUrgent ? 'border-destructive' : ''}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{procurement.title}</h3>
                      {procurement.procurementNumber && (
                        <Badge variant="outline" className="text-xs">
                          {procurement.procurementNumber}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {procurement.region}
                      </span>
                      <span>{procurement.issuingAuthority}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Published {format(new Date(procurement.publishDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <p className="text-sm">{procurement.description}</p>

                    <div className="flex items-center gap-4">
                      <Badge variant={STATUS_COLORS[procurement.status as keyof typeof STATUS_COLORS] || 'outline'}>
                        {procurement.status}
                      </Badge>

                      {formatValue(procurement.estimatedValue, procurement.currency) && (
                        <Badge variant="secondary">
                          {formatValue(procurement.estimatedValue, procurement.currency)}
                        </Badge>
                      )}

                      {procurement.serviceGap && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Service Gap
                        </Badge>
                      )}

                      {procurement.bottleneck && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Bottleneck
                        </Badge>
                      )}

                      {procurement.winProbability && (
                        <Badge variant="outline">
                          {procurement.winProbability}% Win Probability
                        </Badge>
                      )}

                      {daysUntilDeadline !== null && daysUntilDeadline >= 0 && (
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysUntilDeadline === 0 ? 'Due Today' : `${daysUntilDeadline} days left`}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {procurement.contacts.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {procurement.contacts.length} contacts
                        </span>
                      )}
                      {procurement.documents.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {procurement.documents.length} documents
                        </span>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={deletingId === procurement.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/procurement/${procurement.id}`)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(procurement)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(procurement.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}