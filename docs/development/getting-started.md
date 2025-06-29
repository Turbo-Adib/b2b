# Getting Started

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd b2b
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   - Database connection string
   - API keys for external services
   - Authentication secrets

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
/
├── app/                 # Next.js app directory
├── components/         # React components
│   └── ui/            # Shadcn/ui components
├── lib/               # Utility functions and libraries
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── docs/              # Documentation
└── types/             # TypeScript type definitions
```