'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Building2,
  User,
  Target,
  Edit
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  title: string;
  department: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  role: string;
  influence: string;
  notes?: string;
  opportunity?: {
    id: string;
    title: string;
  };
  procurements: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

interface ContactListProps {
  contacts: Contact[];
  onEdit?: (contact: Contact) => void;
  showOpportunity?: boolean;
}

const INFLUENCE_COLORS = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'default',
  KEY_DECISION_MAKER: 'destructive',
} as const;

export function ContactList({ contacts, onEdit, showOpportunity = true }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No government contacts added yet
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {contacts.map((contact) => (
        <Card key={contact.id}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{contact.department}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={INFLUENCE_COLORS[contact.influence as keyof typeof INFLUENCE_COLORS] || 'outline'}>
                    {contact.influence.replace('_', ' ')}
                  </Badge>
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{contact.role}</span>
              </div>

              <div className="space-y-2">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </a>
                )}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-3 w-3" />
                    LinkedIn Profile
                  </a>
                )}
              </div>

              {contact.notes && (
                <p className="text-sm text-muted-foreground">{contact.notes}</p>
              )}

              {showOpportunity && contact.opportunity && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Opportunity:</span>
                    <Badge variant="outline" className="text-xs">
                      {contact.opportunity.title}
                    </Badge>
                  </div>
                </div>
              )}

              {contact.procurements.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Related Procurements ({contact.procurements.length})
                  </p>
                  <div className="space-y-1">
                    {contact.procurements.slice(0, 3).map((proc) => (
                      <div key={proc.id} className="text-xs">
                        <Badge variant="outline" className="mr-2">
                          {proc.status}
                        </Badge>
                        {proc.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}