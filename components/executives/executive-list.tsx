'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Linkedin, 
  Calendar,
  AlertTriangle,
  Target,
  Edit,
  Building2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Executive {
  id: string;
  name: string;
  title: string;
  linkedinUrl?: string;
  email?: string;
  vulnerabilityScore: number;
  riskFactors: string[];
  desperationSignals: string[];
  lastLinkedinPost?: string;
  notes?: string;
  opportunityType?: string;
  company: {
    id: string;
    name: string;
    lastFundingRound?: string;
    lastFundingDate?: string;
    gtmGapDetected: boolean;
  };
}

interface ExecutiveListProps {
  executives: Executive[];
  onEdit?: (executive: Executive) => void;
  showCompany?: boolean;
}

const RISK_FACTOR_LABELS: Record<string, string> = {
  'pipeline_pressure': 'Pipeline Pressure',
  'ad_spend_waste': 'Ad Spend Waste',
  'board_pressure': 'Board Pressure',
  'no_gtm_team': 'No GTM Team',
  'founder_led_sales': 'Founder-Led Sales',
  'recent_hire': 'Recent Hire',
  'public_criticism': 'Public Criticism',
};

export function ExecutiveList({ executives, onEdit, showCompany = true }: ExecutiveListProps) {
  function getVulnerabilityColor(score: number) {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  }

  if (executives.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No executives tracked yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executives.map((executive) => (
        <Card key={executive.id}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{executive.name}</h3>
                  <p className="text-sm text-muted-foreground">{executive.title}</p>
                  {showCompany && (
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{executive.company.name}</span>
                      {executive.company.lastFundingRound && (
                        <Badge variant="outline" className="text-xs">
                          {executive.company.lastFundingRound}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(executive)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vulnerability Score</span>
                  <Badge variant={getVulnerabilityColor(executive.vulnerabilityScore)}>
                    {executive.vulnerabilityScore}%
                  </Badge>
                </div>
                <Progress value={executive.vulnerabilityScore} className="h-2" />
              </div>

              {executive.riskFactors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Risk Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {executive.riskFactors.map((factor) => (
                      <Badge key={factor} variant="outline" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {RISK_FACTOR_LABELS[factor] || factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {executive.desperationSignals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Desperation Signals</p>
                  <div className="flex flex-wrap gap-2">
                    {executive.desperationSignals.map((signal) => (
                      <Badge key={signal} variant="destructive" className="text-xs">
                        {signal.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                {executive.email && (
                  <a
                    href={`mailto:${executive.email}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </a>
                )}
                {executive.linkedinUrl && (
                  <a
                    href={executive.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Linkedin className="h-3 w-3" />
                    LinkedIn
                  </a>
                )}
                {executive.lastLinkedinPost && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Last post {formatDistanceToNow(new Date(executive.lastLinkedinPost), { addSuffix: true })}
                  </span>
                )}
              </div>

              {executive.opportunityType && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Opportunity:</span>
                  <Badge variant="secondary" className="text-xs">
                    {executive.opportunityType}
                  </Badge>
                </div>
              )}

              {executive.notes && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {executive.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}