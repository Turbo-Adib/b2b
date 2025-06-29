'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash,
  Eye,
  Users,
  DollarSign,
  Linkedin,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  website?: string;
  linkedinUrl?: string;
  industry: string;
  lastFundingRound?: string;
  lastFundingAmount?: number;
  lastFundingDate?: string;
  totalFunding?: number;
  pressureScore: number;
  gtmGapDetected: boolean;
  executiveTurnover: boolean;
  analysisNotes?: string;
  executives: any[];
  alerts: any[];
}

interface CompanyListProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onRefresh: () => void;
}

export function CompanyList({ companies, onEdit, onRefresh }: CompanyListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this company?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company');
    } finally {
      setDeletingId(null);
    }
  }

  function getPressureColor(score: number) {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  }

  function formatFunding(amount?: number) {
    if (!amount) return null;
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No companies tracked yet
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => {
        const vulnerableExecs = company.executives.filter(e => e.vulnerabilityScore >= 70).length;
        const unreadAlerts = company.alerts.filter(a => !a.isRead).length;
        
        return (
          <Card key={company.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={deletingId === company.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/companies/${company.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(company)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(company.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pressure Score</span>
                    <Badge variant={getPressureColor(company.pressureScore)}>
                      {company.pressureScore}%
                    </Badge>
                  </div>
                  <Progress value={company.pressureScore} className="h-2" />
                </div>

                {company.lastFundingDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {company.lastFundingRound} {formatFunding(company.lastFundingAmount)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(company.lastFundingDate), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {company.totalFunding && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>Total: {formatFunding(company.totalFunding)}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {company.gtmGapDetected && (
                    <Badge variant="default" className="text-xs">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      GTM Gap
                    </Badge>
                  )}
                  {company.executiveTurnover && (
                    <Badge variant="default" className="text-xs">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Exec Turnover
                    </Badge>
                  )}
                  {vulnerableExecs > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <Users className="mr-1 h-3 w-3" />
                      {vulnerableExecs} Vulnerable
                    </Badge>
                  )}
                  {unreadAlerts > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadAlerts} Alerts
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {company.linkedinUrl && (
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  <div className="flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {company.executives.length} executives tracked
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}