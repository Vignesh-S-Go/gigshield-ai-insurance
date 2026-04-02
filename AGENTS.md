# AGENTS.md - GigShield Development Guide

This document provides essential guidelines for agents working in the GigShield codebase.

## Project Overview

GigShield is an AI-powered parametric income insurance platform for food delivery partners:
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Zustand
- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **UI**: Glass-morphism design with dark mode, Recharts

## Build Commands

### Frontend
```bash
cd frontend
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint (eslint.config.js)
npm run preview  # Preview production build
```

### Backend
```bash
cd backend
npm start        # Start Express server
npm run dev      # Start with nodemon (auto-restart)
```

### Running Tests
**No test framework currently configured.** To add and run tests:

```bash
# Frontend - Vitest (recommended for Vite)
cd frontend
npm install -D vitest
npm run test          # Run all tests
npm run test -- App   # Run tests matching "App"
npm run test --watch  # Watch mode

# Backend - Jest
cd backend
npm install -D jest
npm run test          # Run all tests
npm run test -- --testNamePattern="auth"  # Single test
npm run test --watch  # Watch mode
```

## Directory Structure

```
/backend
  /config/          # Supabase DB configuration
  /controllers/     # Route handlers (auth, claims, policies, workers, users, zones)
  /middlewares/     # Error handling middleware
  /models/          # Database models
  /routes/          # Express routers
  /services/        # AI, weather, risk, OTP services
  /utils/           # timeUtils.js, pricingModel.js, fraudDetection.js
  schema.sql        # Database schema for Supabase
  server.js         # Express entry point

/frontend
  /src
    /api/           # API clients (authApi.js, userApi.js, explainApi.js, etc.)
    /components/    # Reusable UI components
    /layouts/       # Layout wrappers
    /pages/         # Route pages
    /services/      # api.js, aiService.js, weatherService.js
    /store/         # Zustand store (useStore.js)
    /utils/         # helpers.js, mockData.js, pricingModel.js, rulesEngine.js
    App.jsx         # Root component
    main.jsx        # Entry point
    index.css       # Tailwind v4 theme, glass components
```

## Code Style Guidelines

### General
- **ES modules**: Use `import/export` syntax
- **No semicolons**: Follow the existing codebase style
- **Indentation**: 2 spaces
- **async/await**: Use for all async operations
- **try/catch**: Always use with `next(error)` in backend controllers

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DashboardPage.jsx`, `MetricCard.jsx` |
| Files/Routes | kebab-case | `claim-routes.js`, `user-api.js` |
| Variables/Functions | camelCase | `fetchClaims`, `isAuthenticated` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAYOUT`, `API_BASE_URL` |
| CSS classes | kebab-case | `glass-card`, `btn-primary`, `metric-card` |
| React hooks | camelCase with `use` prefix | `useState`, `useEffect` |

### Backend Patterns

**Controller Pattern:**
```javascript
export const getData = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from('table').select('*')
        if (error) throw error
        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
}
```

**Error Handling:**
- Use `next(error)` pattern in all controllers
- Return `{ success: false, message: '...' }` for API errors
- Use early returns for validation errors

**Response Format:**
```javascript
// Success
res.status(201).json({ success: true, data: newItem })

// Error
res.status(400).json({ success: false, message: 'Error description' })
```

**Route Pattern:**
```javascript
import express from 'express'
import { handler1, handler2 } from '../controllers/controller.js'

const router = express.Router()

router.get('/', handler1)
router.post('/', handler2)

export default router
```

### Frontend Patterns

**Component Structure:**
```javascript
import React from 'react'
import { useState } from 'react'
import { ExternalComponent } from '@/components'
import { useStore } from '@/store/useStore'
import { helperFn } from '@/utils/helpers'
import { Icon } from 'lucide-react'

export default function ComponentName() {
    const { state, setState } = useStore()
    const [local, setLocal] = useState(null)

    return <div>...</div>
}
```

**Imports Order:**
1. React and hooks (`react`, `useState`, etc.)
2. External libraries (`react-router-dom`, `axios`, etc.)
3. Lucide icons
4. Internal components (`@/components`)
5. Store (`@/store/useStore`)
6. Utils/helpers (`@/utils/helpers`)

**State Management:**
- `useStore` (Zustand) for global state
- `useState` for local component state
- Prefer Zustand actions over direct state mutation

### Tailwind CSS v4

**Custom Colors (from index.css):**
- Primary: `--color-primary-*` (indigo shades)
- Success: `--color-success-*` (green shades)
- Danger: `--color-danger-*` (red shades)
- Warning: `--color-warning-*` (amber shades)
- Dark: `--color-dark-*` (slate shades)

**Custom Components:**
```css
.glass-card    /* Glass-morphism card with blur */
.glass-sidebar /* Glass-morphism sidebar */
.btn-primary   /* Primary gradient button */
.btn-secondary /* Secondary outlined button */
.input-field   /* Styled input */
.badge         /* Pill-shaped badge */
.skeleton      /* Loading skeleton animation */
```

## ESLint Configuration

**Frontend (frontend/eslint.config.js):**
- Extends: JS recommended, react-hooks recommended, react-refresh/vite
- Custom rule: `no-unused-vars` allows vars starting with uppercase (React components)
- Ignores: `dist/` folder

Run linting:
```bash
cd frontend && npm run lint
```

## Database Schema

Run `backend/schema.sql` in Supabase SQL Editor.

### Key Tables
- **users** - phone (UNIQUE), name, email, role (worker/admin), earnings, platform
- **workers** - GS-XXXXXXXX IDs, risk_score, earnings_history, risk_breakdown
- **claims** - trigger_type (Rain/Heat/Flood/AQI/Curfew/Emergency), status, payout
- **policies** - plan_type (Basic/Standard/Pro), premium, max_payout
- **notifications** - For worker notifications
- **payouts** - Claim payouts with status

### Key Points
- Phone format: `+91 XXXXXXXXXX` (use `normalizePhone()`)
- All timestamps in IST (Asia/Kolkata)
- RLS disabled for development
- Worker IDs: `GS-XXXXXXXX` format

## API Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST | OTP send/verify |
| `/api/user` | GET, POST, PUT | User profile |
| `/api/workers` | GET, PUT | Worker metrics/stats |
| `/api/claims` | GET, POST | Claims with AI analysis |
| `/api/claim` | * | Legacy claim routes |
| `/api/policies` | GET, POST | Policy management |
| `/api/zones` | GET | Zone risk data |
| `/api/payouts` | GET | Payout history |
| `/api/smart-payout` | POST | Smart payout processing |
| `/api/explain` | POST | AI explanations |
| `/api/risk` | GET, POST | Risk assessment |
| `/api/insurance` | GET, POST | Insurance operations |
| `/api/notifications` | GET, PUT | Notifications |
| `/api/gigs` | GET, POST | Gig management |

## Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000/api
VITE_OPENROUTER_API_KEY=your_key
VITE_WEATHER_API_KEY=your_key
```

**Backend (.env):**
```
PORT=8000
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GEMINI_API_KEY=your_key
WEATHER_API_KEY=your_key
```

## Important Files

| File | Purpose |
|------|---------|
| `backend/schema.sql` | Database schema |
| `backend/services/aiService.js` | Gemini API with fallback |
| `backend/services/claimService.js` | Claim validation logic |
| `backend/middlewares/errorHandler.js` | Global error handler |
| `frontend/src/services/api.js` | API client |
| `frontend/src/store/useStore.js` | Zustand global state |
| `frontend/src/index.css` | Tailwind theme & components |

## Notes
- Backend uses nodemon for development (not hot reload)
- Frontend uses Vite with React 19
- Tailwind CSS v4 with @tailwindcss/vite plugin
- All time utilities use IST (Asia/Kolkata) timezone
