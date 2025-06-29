# RegIntel - Personal EU Regulatory Intelligence System

A comprehensive intelligence platform designed to identify and monopolize EU regulatory compliance opportunities 12-18 months before competitors become aware.

## Overview

RegIntel is a private deployment intelligence system that combines automated monitoring, scoring algorithms, and relationship tracking to give you a decisive advantage in the EU regulatory compliance market. Built with Next.js 14+, TypeScript, and PostgreSQL.

## Key Features

### 🎯 Opportunity Identification Engine
- Automated discovery of high-value regulatory opportunities
- Sophisticated scoring algorithm (0-100 scale) based on revenue potential, market gaps, and competition
- Real-time alerts for opportunities scoring 80+
- Comprehensive filtering by status, market gap, and timeline

### 🔍 Deep-Dive Research Dashboard
- Dedicated workspace for opportunity analysis
- Research task management with priority tracking
- Multi-tab interface: regulation analysis, timeline, market intel, government contacts
- Integrated note-taking and progress tracking

### 👥 Competitive Intelligence Tracker
- Monitor competitor activities in real-time
- Threat level assessment (Low/Medium/High/Critical)
- Activity type categorization with visual indicators
- Timeline view of competitor movements

### 🏛️ Government Signal Tracking
- Multi-region procurement monitoring (Brussels, Paris, Berlin, etc.)
- Government contact database with influence levels
- Deadline alerts (3/7/14 days)
- Service gap and bottleneck identification

### 💼 Private Market Chaos Intelligence
- Company pressure scoring based on funding timeline and indicators
- Executive vulnerability profiling
- GTM gap detection
- Desperation signal tracking

### 📊 Daily Intelligence Briefing
- Automated daily summaries
- Executive insights and key metrics
- Priority action items
- Historical briefing access

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **UI Components**: Shadcn/ui with Tailwind CSS v3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Iron-session (single-user system)
- **State Management**: React hooks and context
- **Date Handling**: date-fns

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/regintel.git
cd regintel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/regintel"
SESSION_SECRET="your-32-character-secret-key"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Project Structure

```
/app                 # Next.js app directory
  /(auth)           # Authentication pages (login/register)
  /(dashboard)      # Protected dashboard pages
    /opportunities  # Opportunity tracking
    /research       # Deep-dive research workspace
    /competitors    # Competitive intelligence
    /government     # Procurement & contacts
    /companies      # Company pressure tracking
    /executives     # Executive vulnerability
    /briefings      # Daily intelligence briefings
  /api              # API routes
/components         # Reusable UI components
/lib                # Utilities and configurations
/prisma             # Database schema
/docs               # Project documentation
```

## Key Algorithms

### Opportunity Scoring (0-100)
- Revenue potential: 0-30 points
- Market gap size: 0-25 points
- Competition level: 0-20 points
- Lead time advantage: 0-15 points
- Status progress: 0-10 points

### Company Pressure Score (0-100)
- Days since funding: 0-30 points
- Funding adequacy: 0-20 points
- GTM gap: 25 points
- Executive turnover: 15 points
- Executive vulnerability: 0-10 points

### Executive Vulnerability Score (0-100)
- Title-based risk: 0-20 points
- Risk factors: 0-40 points
- Desperation signals: 0-30 points
- Company pressure: 0-10 points

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management

- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma db push` - Push schema changes
- `npx prisma generate` - Generate Prisma client

## Deployment

This is designed as a private deployment system. Recommended deployment options:

1. **VPS/Cloud Instance**: Deploy to a private server (DigitalOcean, AWS EC2, etc.)
2. **Docker**: Use the included Dockerfile for containerized deployment
3. **Private Cloud**: Deploy to your organization's private infrastructure

### Environment Variables

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: 32+ character secret for session encryption
- `NODE_ENV`: Set to "production"

## Security

- Single-user authentication system
- Session-based authentication with iron-session
- All data is private to the authenticated user
- No external data sharing
- Encrypted session storage

## Contributing

This is a private intelligence system. Contributions should focus on:
- Enhancing scoring algorithms
- Adding new data sources
- Improving the UI/UX
- Performance optimizations

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

Built with focus on regulatory intelligence and competitive advantage.