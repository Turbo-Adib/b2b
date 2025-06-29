# Competitive Intelligence Tracker

## Overview

The Competitive Intelligence Tracker monitors competitor movements in regulatory spaces, providing early warning signals when competitors are positioning for the same opportunities. It tracks various activities and assesses threat levels to help maintain competitive advantage.

## Features

### 1. Activity Tracking
- **Multiple Activity Types**: 
  - LinkedIn posts and thought leadership
  - Conference speaking engagements
  - Tender applications
  - Service announcements
  - Partnership announcements
  - Media interviews
  - Government meetings
- **Detailed Recording**: Description, date, source URL
- **Opportunity Linking**: Connect activities to specific opportunities

### 2. Threat Assessment
- **Four Threat Levels**:
  - **Low**: General market presence
  - **Medium**: Active interest shown
  - **High**: Direct competition likely
  - **Critical**: Immediate competitive threat
- **Automated Alerts**: High/Critical activities trigger notifications
- **Visual Indicators**: Color-coded threat levels throughout UI

### 3. Competitor Analytics
- **Activity Summary**: Total activities per competitor
- **Opportunity Coverage**: Which opportunities each competitor targets
- **Threat Distribution**: Breakdown by threat level
- **Timeline Analysis**: Recent activity patterns
- **Ranking System**: Most active competitors highlighted

### 4. Filtering & Search
- **Time-based Filters**: Last 7/30/90/180 days or all time
- **Threat Level Filters**: Focus on high-priority threats
- **Competitor Search**: Find specific competitor activities
- **Multi-tab Views**: Overview, Timeline, High Threat, Recent

## UI Components

### Overview Tab
- **Metrics Cards**:
  - Active competitors count
  - Total activities tracked
  - Average threat level with progress bar
  - High/Critical activity count
- **Competitor Rankings**:
  - Top 10 most active competitors
  - Activity distribution visualization
  - Latest activity timestamps
  - Threat level badges

### Timeline Tab
- Chronological list of all activities
- Full activity details with source links
- Inline editing and deletion
- Visual activity type indicators (emojis)

### High Threat Tab
- Filtered view of HIGH and CRITICAL activities
- Focused on immediate competitive threats
- Quick action items for response

### Activity Cards
Each activity displays:
- Competitor name and activity type
- Date and description
- Linked opportunity
- Threat level badge
- Source URL (if available)
- Action menu (edit/delete)

## API Endpoints

### List Activities
```
GET /api/competitors
Query params: opportunityId, threatLevel, competitorName, days
Returns: activities array, summary data, total count
```

### Create Activity
```
POST /api/competitors
Body: opportunityId, competitorName, activityType, etc.
Creates alert for high/critical threats
```

### Update Activity
```
PATCH /api/competitors/[id]
Body: Partial activity data
```

### Delete Activity
```
DELETE /api/competitors/[id]
```

## Usage Workflow

1. **Monitor**: Regularly check the overview for new competitor movements
2. **Track**: Add activities as soon as detected from any source
3. **Assess**: Assign appropriate threat levels based on impact
4. **Analyze**: Use summary data to identify patterns
5. **Respond**: Take action on high/critical threats

## Best Practices

### Activity Recording
- Be specific in descriptions
- Always include source URLs for verification
- Update threat levels as situations evolve
- Link to correct opportunities

### Threat Level Guidelines
- **Low**: General industry presence, no specific focus on your opportunities
- **Medium**: Showing interest in similar regulatory areas
- **High**: Directly competing for same opportunities
- **Critical**: Has advantages or insider information requiring immediate response

### Intelligence Sources
- LinkedIn Sales Navigator for executive movements
- Conference agendas and speaker lists
- Tender platforms and procurement notices
- Company press releases and announcements
- Industry news and trade publications

## Automated Features

### Alert Generation
- Automatic alerts for HIGH and CRITICAL activities
- Notifications include competitor name and opportunity
- Action required flag for immediate attention

### Summary Calculations
- Real-time activity aggregation
- Threat level averaging
- Competitor ranking updates
- Timeline-based filtering

## Integration Points

### With Opportunities
- Activities linked to specific opportunities
- Threat assessment affects opportunity scoring
- Competitor count shown in opportunity list

### With Alerts System
- High/Critical activities generate alerts
- Unread alert counts in navigation
- Direct links to activity details

## Future Enhancements

- Automated activity detection from RSS feeds
- Competitor company profiles with history
- Predictive threat modeling
- Competitive response playbooks
- Win/loss analysis against specific competitors