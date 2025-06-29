'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Eye, 
  Edit, 
  Trash, 
  Calendar,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface Opportunity {
  id: string;
  title: string;
  regulationType: string;
  status: string;
  priority: string;
  opportunityScore: number;
  leadTimeMonths: number | null;
  implementationDate: string | null;
  revenuePotential: string;
  competitionLevel: string;
  _count: {
    competitors: number;
    notes: number;
    documents: number;
    researchTasks: number;
  };
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  onEdit: (opportunity: Opportunity) => void;
  onRefresh: () => void;
}

const STATUS_COLORS = {
  IDENTIFIED: 'default',
  RESEARCHING: 'secondary',
  POSITIONING: 'outline',
  PURSUING: 'default',
  WON: 'default',
  LOST: 'destructive',
  ARCHIVED: 'outline',
} as const;

const PRIORITY_COLORS = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  CRITICAL: 'destructive',
} as const;

export function OpportunityList({ opportunities, onEdit, onRefresh }: OpportunityListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('Failed to delete opportunity');
    } finally {
      setDeletingId(null);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Opportunity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Potential</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No opportunities found. Create your first opportunity to get started.
              </TableCell>
            </TableRow>
          ) : (
            opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell>
                  <div className="font-medium">{opportunity.title}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{opportunity.regulationType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[opportunity.status as keyof typeof STATUS_COLORS] || 'default'}>
                    {opportunity.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={PRIORITY_COLORS[opportunity.priority as keyof typeof PRIORITY_COLORS] || 'outline'}>
                    {opportunity.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`font-bold ${getScoreColor(opportunity.opportunityScore)}`}>
                    {opportunity.opportunityScore}
                  </span>
                </TableCell>
                <TableCell>
                  {opportunity.implementationDate ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(opportunity.implementationDate), 'MMM yyyy')}
                      {opportunity.leadTimeMonths && (
                        <span className="text-muted-foreground">
                          ({opportunity.leadTimeMonths}m)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.revenuePotential}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.competitionLevel}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {opportunity._count.competitors}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {opportunity._count.notes}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {opportunity._count.researchTasks}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={deletingId === opportunity.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/opportunities/${opportunity.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(opportunity.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}