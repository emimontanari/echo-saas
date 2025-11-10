# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SaaS application built as a **Turborepo monorepo** with two Next.js applications sharing a centralized Convex backend, authentication via Clerk, and a component library based on shadcn/ui.

## Tech Stack

- **Build System:** Turborepo with pnpm workspaces
- **Frontend:** Next.js 15 (App Router), React 19
- **Backend:** Convex (serverless functions and database)
- **Authentication:** Clerk with organization support
- **UI:** shadcn/ui components, Tailwind CSS v4
- **Language:** TypeScript
- **Dev Server:** Turbopack

## Repository Structure

```
apps/
  web/           Main Next.js application with authentication (port 3000)
  widget/        Embeddable widget Next.js application (port 3001)
packages/
  backend/       Convex backend functions and schema
  ui/            Shared shadcn/ui components and styles
  math/          Shared utility functions (example package)
  eslint-config/ Shared ESLint configuration
  typescript-config/ Shared TypeScript configuration
```

## Development Commands

### Root-level commands (via Turborepo):
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### App-specific commands:
- **Web app:** Navigate to `apps/web` or use turbo filters
  - `pnpm dev` - Start dev server on port 3000
  - `pnpm build` - Production build
  - `pnpm typecheck` - Type check without building
  - `pnpm lint:fix` - Auto-fix linting issues

- **Widget app:** Navigate to `apps/widget`
  - `pnpm dev` - Start dev server on port 3001
  - `pnpm build` - Production build

- **Backend:** Navigate to `packages/backend`
  - `pnpm dev` - Start Convex dev server with hot reload
  - `pnpm setup` - Initialize Convex backend (run once)

### Adding shadcn/ui components:
```bash
pnpm dlx shadcn@latest add button -c apps/web
```
This places components in `packages/ui/src/components` for workspace-wide sharing.

## Architecture

### Authentication Flow
- Clerk handles user authentication and organization management
- `middleware.ts` enforces authentication on protected routes
- Users must belong to an organization to access dashboard routes
- If a user lacks an organization, they're redirected to `/org-selection`
- Protected routes require both `userId` and `orgId`

### Convex Backend (`packages/backend`)
- Backend is shared across all frontend apps via `@workspace/backend`
- Schema defined in `convex/schema.ts`
- Clerk authentication configured in `convex/auth.config.ts`
- Functions use Convex's `query`, `mutation`, and `action` patterns
- Frontend uses `useQuery` and `useMutation` hooks from `convex/react`
- Type-safe API via generated types in `convex/_generated`

### Module-Based Architecture (Web App)
The web app organizes features into modules under `apps/web/modules/`:
- Each module contains its domain logic, UI components, and utilities
- Example: `modules/auth/` contains authentication guards and components
- Promotes feature isolation and code organization

### Component Sharing
- UI components live in `packages/ui` and are imported as `@workspace/ui/components/*`
- Global styles imported from `@workspace/ui/globals.css`
- Tailwind config shared via `packages/ui/postcss.config`

### Convex + Clerk Integration
- `ConvexProviderWithClerk` wraps the app in `components/providers.tsx`
- Requires `NEXT_PUBLIC_CONVEX_URL` environment variable
- Backend authenticates users via `CLERK_JWT_ISSUER_DOMAIN` (set in Convex dashboard)

## Environment Variables

### Web App (`apps/web`):
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL (required)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

### Convex Backend (`packages/backend`):
- `CLERK_JWT_ISSUER_DOMAIN` - Set in Convex dashboard for JWT validation

## Route Structure (Web App)

- `(auth)/sign-in` - Clerk sign-in page
- `(auth)/sign-up` - Clerk sign-up page
- `(auth)/org-selection` - Organization selection for users without an org
- `(dashboard)/*` - Protected routes requiring authentication and organization membership

Route groups `(auth)` and `(dashboard)` use layout-based authentication guards:
- `AuthGuard` - Ensures user is authenticated
- `OrganizationGuard` - Ensures user belongs to an organization

## Common Workflows

### Adding a new Convex function:
1. Create a file in `packages/backend/convex/`
2. Export queries, mutations, or actions with argument validators
3. Types are auto-generated on save when running `pnpm dev`
4. Import in frontend: `import { api } from "@workspace/backend/convex/_generated/api"`
5. Use with hooks: `useQuery(api.filename.functionName, args)`

### Adding a new route to the web app:
1. Create route in `apps/web/app/` following Next.js App Router conventions
2. Protected routes should go under `(dashboard)/`
3. Public routes should be added to `isPublicRoute` matcher in `middleware.ts`
4. Routes that don't require an org should be added to `isOrgFreeRoute` matcher

### Creating a new workspace package:
1. Create directory under `packages/`
2. Add `package.json` with `name: "@workspace/package-name"`
3. Add to `dependencies` in consuming apps using `"@workspace/package-name": "workspace:*"`
4. Define `exports` field for public API surface

