'use client';

import { useState } from 'react';
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
  ExternalLink, 
  Edit, 
  Trash,
  Calendar,
  AlertTriangle,
  Link2
} from 'lucide-react';
import { format } from 'date-fns';

interface CompetitorActivity {
  id: string;
  competitorName: string;
  activityType: string;
  activityDate: string;
  description: string;
  sourceUrl?: string;
  threatLevel: string;
  opportunity: {
    id: string;
    title: string;
    status: string;
  };
}

interface CompetitorActivityListProps {
  activities: CompetitorActivity[];
  onEdit?: (activity: CompetitorActivity) => void;
  onRefresh: () => void;
  showOpportunity?: boolean;
}

const THREAT_COLORS = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  CRITICAL: 'destructive',
} as const;

const ACTIVITY_ICONS = {
  'LinkedIn Post': '💼',
  'Conference Speaker': '🎤',
  'Tender Application': '📋',
  'Service Announcement': '📢',
  'Partnership Announcement': '🤝',
  'Thought Leadership': '📝',
  'Media Interview': '📺',
  'Government Meeting': '🏛️',
  'Other': '📌',
};

export function CompetitorActivityList({ 
  activities, 
  onEdit, 
  onRefresh,
  showOpportunity = true 
}: CompetitorActivityListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this activity record?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    } finally {
      setDeletingId(null);
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No competitor activities tracked yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const icon = ACTIVITY_ICONS[activity.activityType as keyof typeof ACTIVITY_ICONS] || '📌';
        
        return (
          <Card key={activity.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {activity.competitorName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{activity.activityType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(activity.activityDate), 'PPP')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed">{activity.description}</p>

                  {showOpportunity && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm text-muted-foreground">Opportunity:</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.opportunity.title}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <Badge 
                      variant={THREAT_COLORS[activity.threatLevel as keyof typeof THREAT_COLORS] || 'outline'}
                      className="flex items-center gap-1"
                    >
                      {activity.threatLevel === 'HIGH' || activity.threatLevel === 'CRITICAL' ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : null}
                      {activity.threatLevel} Threat
                    </Badge>

                    {activity.sourceUrl && (
                      <a
                        href={activity.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Link2 className="h-3 w-3" />
                        View Source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={deletingId === activity.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(activity)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(activity.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}