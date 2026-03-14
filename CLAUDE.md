# Message — Project Instructions

## Development Server
- **Port:** 3017 (registered in ~/dotfiles/ports.json)
- **Command:** `npm run dev`
- **Framework:** Next.js with App Router
- **Base Path:** `/message` (configured in next.config.ts)

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Lucide React (icons)
- Fonts: Bebas Neue (Google Fonts), Glacial Indifference (self-hosted /public/fonts/)
- Dark/Light theme with CSS variables

## Project Structure
- `/src/app/` — Next.js App Router pages
- `/components/` — Shared React components
- `/public/assets/` — Logo files (logo-dark.png, logo-light.png)
- `/public/fonts/` — Glacial Indifference woff2 files

## Design System
- Accent: #5170FF (hover: #3D5CE6)
- Dark bg: #1A1A2E, surface: #16213E
- Light bg: #FAFAFA, surface: #FFFFFF
- Headers: Bebas Neue (uppercase)
- Body: Glacial Indifference

## Key Decisions
- All routes under `/message/` basePath
- Phase 1 = landing page only, no backend
- Form submissions stored in localStorage (Phase 1)
- Logo assets need to be manually added (not available in uploads dir)

## Current Phase
Phase 1: Landing page with sign-up form, placeholder pages, dark/light theme.
