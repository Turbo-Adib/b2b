# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RegIntel is a personal EU regulatory intelligence system built with Next.js 14+, TypeScript, and Shadcn/ui. It's designed to identify and monopolize upcoming EU regulatory compliance opportunities 12-18 months before competitors.

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: Shadcn/ui with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with CSS variables
- **Package Manager**: npm

## Common Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database (Prisma)
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations in development
npx prisma studio        # Open Prisma Studio GUI
npx prisma db push       # Push schema changes without migration
```

## Project Structure

```
/workspaces/b2b/
├── app/                # Next.js app directory (pages, layouts, API routes)
├── components/         # React components
│   └── ui/            # Shadcn/ui components
├── lib/               # Utility functions and shared code
├── prisma/            # Database schema and migrations
├── docs/              # Project documentation
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## Architecture Notes

### Core Modules
1. **Opportunity Identification Engine** - Automatically surfaces high-value regulatory opportunities
2. **Deep-Dive Research Dashboard** - Comprehensive analysis workspace
3. **Competitive Intelligence Tracker** - Monitors competitor activity
4. **Government Signal Tracking** - Automated procurement and policy monitoring
5. **Private Market Intelligence** - Funding round and executive pressure analysis

### Key Design Decisions
- Private deployment only (no public SaaS)
- Real-time data processing with background jobs
- Modular architecture for feature expansion
- Security-first approach with encrypted storage

## Development Guidelines

### When Adding Features
1. Check the PRD (prd.md) for detailed requirements
2. Update relevant documentation in `/docs`
3. Follow the existing component patterns
4. Use Shadcn/ui components when possible
5. Maintain TypeScript strict mode compliance

### Database Changes
1. Create migrations with `npx prisma migrate dev --name <description>`
2. Update seed data if needed
3. Document schema changes in `/docs/architecture`

### UI Components
- Use Shadcn/ui components from `/components/ui`
- Follow the existing color scheme with CSS variables
- Maintain responsive design patterns
- Keep accessibility in mind

## Current Development Status

The project is in active development with major modules implemented:
- ✅ Next.js and TypeScript configured (using Tailwind CSS v3 due to v4 incompatibility)
- ✅ Shadcn/ui integrated with components
- ✅ Documentation structure created
- ✅ PostgreSQL database with Prisma ORM
- ✅ Authentication system (single-user, session-based)
- ✅ Dashboard layout with navigation
- ✅ Opportunity Identification Engine (with scoring algorithm)
- ✅ Competitive Intelligence Tracker (with threat assessment)
- ✅ Government Signal Tracking System (multi-region support)
- ✅ Private Market Chaos Intelligence (company pressure & executive vulnerability)
- ✅ Deep-Dive Research Dashboard (research tasks, regulation analysis, timeline views)
- ✅ Daily Intelligence Briefing System (automated summaries, action items, historical access)
- ⏳ API integrations pending
- ⏳ Web scraping components pending

## Important Files

- `/prd.md` - Product Requirements Document with full feature specifications
- `/docs/features/roadmap.md` - Implementation timeline and status
- `/docs/architecture/overview.md` - System design and technical decisions
- `/docs/development/getting-started.md` - Setup instructions