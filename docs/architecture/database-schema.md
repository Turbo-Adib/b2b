# Database Schema Documentation

## Overview

The RegIntel database is designed to support comprehensive regulatory intelligence tracking, from opportunity identification through to execution. It uses PostgreSQL with Prisma ORM for type-safe database access.

## Core Models

### User
Single-user authentication model for private deployment.
- Stores basic user information and authentication credentials
- Central relationship point for all user-specific data

### Opportunity
The heart of the system - tracks regulatory opportunities from identification to completion.
- **Scoring System**: Automated scoring based on revenue potential, market gap, and competition
- **Timeline Tracking**: Implementation dates, deadlines, and lead time calculations
- **Status Management**: Full lifecycle tracking from IDENTIFIED to WON/LOST
- **Legislative Tracking**: Real-time updates on legislative stage changes

### CompetitorActivity
Monitors competitor movements in target regulatory spaces.
- Tracks various activity types (LinkedIn posts, conference speaking, tender applications)
- Threat level assessment for prioritization
- Linked to specific opportunities for context

### GovernmentContact
Maps key government stakeholders and decision-makers.
- Role-based categorization (implementation lead, policy maker, tender authority)
- Influence level tracking for relationship prioritization
- Contact history and notes for relationship management

### Procurement
Comprehensive tender and procurement opportunity tracking.
- Multi-region support (EU, US, Singapore, UAE)
- Service gap and bottleneck identification
- Win probability assessment
- Proposal draft storage

### Company & Executive
Private market intelligence for identifying pressure points.
- **Company**: Funding history, pressure indicators, GTM gap detection
- **Executive**: Vulnerability scoring, social signal analysis, opportunity mapping
- Designed to identify executives under pressure who need quick wins

### Alert
Real-time notification system for critical events.
- Multiple alert types covering all aspects of the intelligence system
- Priority levels and action requirements
- Expiration dates for time-sensitive alerts

### Supporting Models
- **Document**: Centralized document storage with relationship tracking
- **Note**: Research notes with tagging system
- **SavedSearch**: Automated monitoring configurations
- **ResearchTask**: Task management for opportunity research
- **Report**: Generated intelligence reports

## Key Design Decisions

### 1. Flexible Scoring System
Uses floating-point scores with enum-based categorization for both automated and manual assessment.

### 2. Timeline-Centric Design
Heavy emphasis on dates and deadlines to maintain competitive advantage through early positioning.

### 3. Relationship Mapping
Extensive use of relational connections to build comprehensive intelligence pictures.

### 4. Audit Trail
All models include createdAt/updatedAt for compliance and historical analysis.

### 5. JSON Fields
Strategic use of JSON fields (metadata, query) for flexibility without schema changes.

## Indexes

Strategic indexes on:
- User-specific queries (userId + status)
- Time-based queries (dates, deadlines)
- Scoring queries (opportunity scores, vulnerability scores)
- Performance-critical lookups

## Enums

Comprehensive enum system ensures data consistency:
- Status enums for lifecycle management
- Level enums (Priority, ThreatLevel, etc.) for consistent categorization
- Type enums for classification
- Frequency enums for automation

## Security Considerations

- Password field for local authentication (should be hashed)
- User isolation through foreign key relationships
- No multi-tenancy required (single-user system)

## Future Considerations

The schema is designed to accommodate:
- Additional data sources
- Enhanced scoring algorithms
- More sophisticated relationship mapping
- Extended automation capabilities