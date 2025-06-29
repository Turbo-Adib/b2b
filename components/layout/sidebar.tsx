'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Target, 
  Search, 
  Users, 
  Building2, 
  UserCheck,
  Bell,
  FileText,
  Settings,
  TrendingUp
} from 'lucide-react';

const navigation = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Opportunities',
    href: '/opportunities',
    icon: Target,
  },
  {
    title: 'Research',
    href: '/research',
    icon: Search,
  },
  {
    title: 'Competitors',
    href: '/competitors',
    icon: Users,
  },
  {
    title: 'Procurement',
    href: '/procurement',
    icon: Building2,
  },
  {
    title: 'Companies',
    href: '/companies',
    icon: TrendingUp,
  },
  {
    title: 'Executives',
    href: '/executives',
    icon: UserCheck,
  },
  {
    title: 'Briefings',
    href: '/briefings',
    icon: FileText,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Bell,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-2xl font-bold">RegIntel</h2>
        <p className="text-sm text-muted-foreground">Regulatory Intelligence</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}