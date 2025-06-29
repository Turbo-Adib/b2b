# Opportunity Identification Engine

## Overview

The Opportunity Identification Engine is the core module for tracking and managing regulatory opportunities. It provides automated scoring, timeline tracking, and comprehensive opportunity lifecycle management.

## Features

### 1. Opportunity Management
- **Create & Edit**: Add new opportunities with detailed information
- **Status Tracking**: Monitor opportunities through their lifecycle (Identified → Researching → Positioning → Pursuing → Won/Lost)
- **Priority Levels**: Categorize by Low, Medium, High, or Critical priority
- **Filtering & Search**: Find opportunities by status, priority, or keyword

### 2. Automated Scoring System

The scoring algorithm (0-100) considers:
- **Base Score**: 50 points
- **Revenue Potential**: 
  - Low: +10 points
  - Medium: +20 points
  - High: +30 points
  - Very High: +40 points
- **Market Gap**:
  - Low: +5 points
  - Medium: +15 points
  - High: +25 points
  - Very High: +35 points
- **Competition Level** (inverse scoring):
  - None: +25 points
  - Low: +20 points
  - Medium: +10 points
  - High: +5 points
  - Saturated: +0 points
- **Lead Time Bonus**:
  - 18+ months: +15 points
  - 12-17 months: +10 points
  - 6-11 months: +5 points
- **Status Penalty**: Lost/Archived opportunities receive 50% score reduction

### 3. Timeline Management
- **Implementation Date**: Target date for regulation enforcement
- **Deadline Tracking**: Key dates for positioning
- **Lead Time Calculation**: Automatic calculation of months ahead of implementation
- **Legislative Stage**: Track progress through the EU legislative process

### 4. Comprehensive Details
- **Regulation Types**: Regulation, Directive, Implementing Act, etc.
- **Geographic Scope**: Track affected countries
- **Industry Impact**: Identify target industries
- **Compliance Requirements**: Document key obligations

### 5. Related Data Tracking
Each opportunity tracks:
- **Competitor Activity**: Monitor competitor movements
- **Government Contacts**: Key stakeholder relationships
- **Documents**: Store relevant resources
- **Research Notes**: Capture insights
- **Research Tasks**: Manage action items
- **Alerts**: Unread notifications

## API Endpoints

### List Opportunities
```
GET /api/opportunities
Query params: status, priority, sortBy, order
```

### Create Opportunity
```
POST /api/opportunities
Body: title, description, regulationType, etc.
```

### Get Single Opportunity
```
GET /api/opportunities/[id]
Returns: Full opportunity with related data
```

### Update Opportunity
```
PATCH /api/opportunities/[id]
Body: Partial opportunity data
```

### Delete Opportunity
```
DELETE /api/opportunities/[id]
```

## UI Components

### Opportunities List Page (`/opportunities`)
- Tabbed view (Active, Won, Lost, Archived, All)
- Search and filter controls
- Quick actions menu per opportunity
- Score visualization with color coding

### Opportunity Detail Page (`/opportunities/[id]`)
- Overview cards with key metrics
- Detailed information sections
- Tabbed related data (competitors, contacts, documents, notes, tasks)
- Active alerts display

### Opportunity Form
- Modal dialog for create/edit
- Field validation
- Multi-select for industries and countries
- Date pickers for timeline management

## Usage Flow

1. **Identify**: Create new opportunity when regulation is discovered
2. **Research**: Add notes, documents, and track competitors
3. **Position**: Build government contacts, prepare proposals
4. **Pursue**: Track active engagement and deadlines
5. **Close**: Mark as Won/Lost with learnings

## Best Practices

1. **Early Entry**: Add opportunities as soon as identified for maximum lead time
2. **Regular Updates**: Keep status and stage current for accurate scoring
3. **Comprehensive Tracking**: Use all related data features for complete picture
4. **Score Monitoring**: Focus on high-scoring opportunities for best ROI
5. **Competition Awareness**: Regularly update competitor activity

## Future Enhancements

- Automated opportunity discovery from RSS feeds
- AI-powered scoring refinements
- Collaborative features for team deployment
- Integration with procurement systems
- Predictive analytics for success probability