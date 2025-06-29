# Dashboard Layout

## Overview

The RegIntel dashboard provides a comprehensive interface for regulatory intelligence management. It features a persistent sidebar navigation, global search, and notification system.

## Layout Structure

### Components

#### Sidebar (`/components/layout/sidebar.tsx`)
- Fixed navigation menu with all major sections
- Active state highlighting
- Icon-based navigation items
- Sections include:
  - Dashboard (overview)
  - Opportunities
  - Research
  - Competitors
  - Procurement
  - Companies
  - Executives
  - Alerts
  - Reports
  - Settings

#### Header (`/components/layout/header.tsx`)
- Global search bar for quick access
- Notification badge with count
- User profile dropdown with:
  - Account information
  - Settings link
  - Logout option

#### Dashboard Layout (`/components/layout/dashboard-layout.tsx`)
- Wrapper component combining sidebar and header
- Responsive design with scrollable main content area
- Consistent styling across all pages

### Route Structure

The dashboard uses Next.js route groups:
- `/(dashboard)/*` - All authenticated pages
- `/login` and `/register` - Public authentication pages

### Dashboard Home Page

The main dashboard (`/app/(dashboard)/page.tsx`) displays:

1. **Key Metrics Cards**
   - Active Opportunities count
   - Average Lead Time (months ahead of market)
   - Open Tenders with total value
   - Competitor Activity movements

2. **High Priority Opportunities**
   - Scored opportunities list
   - Revenue potential badges
   - Competition level indicators
   - Quick action buttons

3. **Recent Alerts**
   - Time-stamped notifications
   - Priority indicators
   - Quick view actions

## Navigation Flow

1. **Authentication Required**: Middleware ensures all dashboard routes require login
2. **Persistent Navigation**: Sidebar remains visible across all sections
3. **Contextual Actions**: Each section has relevant actions and filters
4. **Global Search**: Available from any page via header search bar

## Responsive Design

- Desktop: Full sidebar + content
- Tablet/Mobile: Collapsible sidebar (future enhancement)
- Consistent spacing and typography using Tailwind CSS

## Future Enhancements

- Mobile-responsive sidebar toggle
- Keyboard navigation shortcuts
- Customizable dashboard widgets
- Dark mode toggle
- Search functionality implementation