# Corals & Shells Diving — CAS Academy

## Project Overview

Bilingual (EN/AR) website for a diving academy based in Al Khobar, Saudi Arabia. Built with Laravel 11 + React 18 + TypeScript + Tailwind CSS. Serves as the public-facing site and admin CMS.

## Tech Stack

- **Backend:** Laravel 11, PHP 8.2+, MySQL, Filament admin panel
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Framer Motion
- **API:** RTK Query (Redux Toolkit) consuming Laravel REST endpoints
- **i18n:** react-i18next with JSON files (`public/locales/{en,ar}/common.json`)
- **Deployment:** Pre-compiled assets committed to repo — no `npm run build` on server

## Project Structure

```
app/                        # Laravel backend
├── Http/Controllers/Api/   # API controllers
├── Models/                 # Eloquent models
├── Filament/               # Admin panel (pages, resources)
database/
├── migrations/             # Schema changes
├── seeders/                # ProductionSeeder (main seeder)
resources/
├── js/
│   ├── pages/              # React page components
│   ├── components/
│   │   ├── features/       # Feature components (HeroSlider, Calendar, etc.)
│   │   ├── ui/             # Primitives (Button, Card, Section, HorizontalScroll)
│   │   ├── layout/         # Navbar, Footer
│   │   └── animations/     # Ocean decorations, bubbles, waves
│   ├── services/api.ts     # RTK Query API definitions
│   └── types/              # TypeScript interfaces
├── views/app.blade.php     # Main HTML template
public/
├── locales/{en,ar}/        # Translation JSON files
├── build/                  # Compiled assets (committed)
└── static/                 # Static images
```

## Critical Rules

### Code Quality
- **Never hardcode English text.** All user-facing strings must use `t('key')` from react-i18next
- **Every EN key needs an AR key.** When adding to `en/common.json`, always add the Arabic translation to `ar/common.json`
- **Mobile-first Tailwind.** Base classes are mobile. Use `sm:` for tablet, `lg:` for desktop. Never use `text-4xl` without a mobile override like `text-2xl sm:text-4xl`
- **No `git add -A`.** Stage specific files. Never commit `.env`, `storage.zip`, `node_modules/`
- **No Co-Authored-By lines** in commit messages (per global settings)
- **Run `npm run build` after every frontend change** to verify compilation before committing

### Database
- **Seeders use `updateOrCreate`** keyed on unique fields to prevent duplicates
- **Translations are polymorphic** — stored in `translations` table (translatable_type, translatable_id, locale, field, value)
- **Migrations must be idempotent** — check `Schema::hasColumn()` before adding columns
- **Never re-run full seeder in production** without understanding it re-seeds ALL data

### Design
- **Brand:** "Corals & Shells Diving — CAS Academy"
- **Tone:** Calm, disciplined, professional — not playful, not corporate
- **Heavy animations hidden on mobile** (`hidden sm:block` on decoration components)
- **Max 10 bubbles on mobile** in UnderwaterOverlay
- **Button sizes scale responsively** — `lg` = `px-5 py-2.5 text-sm sm:px-8 sm:py-4 sm:text-lg`

## Workflow: How to Use Agents & Skills

### For any task, follow this decision tree:

```
User request
    │
    ├─ "Build a new section/component" → @frontend-dev + /component-create
    ├─ "Fix a visual/layout issue"     → @ux-designer
    ├─ "Review my changes"             → @qa-tester + /code-review
    ├─ "Check mobile responsiveness"   → /mobile-audit
    ├─ "Update text/translations"      → @content-manager + /translate
    ├─ "API/database/migration work"   → @backend-dev
    ├─ "Find something in the code"    → @researcher
    ├─ "Check SEO"                     → /seo-check
    ├─ "Deploy"                        → /deploy
    ├─ "Build & verify"               → /build-test
    └─ "Review UX quality"            → /ux-review
```

### Standard workflow for feature implementation:

1. **Research** — use `researcher` agent to understand current state
2. **Implement** — use `frontend-dev` or `backend-dev` agent
3. **Translate** — run `/translate` to sync EN/AR
4. **Build** — run `/build-test` to verify compilation
5. **Review** — use `qa-tester` agent to catch issues
6. **Mobile check** — run `/mobile-audit` on changed pages
7. **UX polish** — use `ux-designer` agent for visual refinement
8. **Deploy** — run `/deploy` when ready

### Available Skills (11)

| Invoke | Type | Purpose |
|---|---|---|
| `/mobile-audit` | Manual + Auto | Full mobile responsiveness audit |
| `/code-review` | Manual + Auto | Code quality, security, a11y review |
| `/ux-review` | Manual + Auto | 10-point UX evaluation |
| `/translate` | Manual + Auto | Sync EN/AR translation files |
| `/build-test` | Manual + Auto | Build frontend, verify no errors |
| `/seo-check` | Manual + Auto | SEO audit (meta, semantic HTML, sitemap) |
| `/deploy` | Manual only | Commit, push, server deployment steps |
| `/component-create` | Manual only | Scaffold new component: `/component-create Name type` |
| `design-system` | Background | Color, typography, spacing tokens (auto-loaded) |
| `layout-patterns` | Background | Section layout patterns reference (auto-loaded) |
| `micro-interactions` | Background | Animation/motion guidelines (auto-loaded) |

### Available Agents (6)

| Agent | Model | Preloaded Skills | Use For |
|---|---|---|---|
| `frontend-dev` | inherit | mobile-audit, component-create | UI features, layout fixes, responsive components |
| `ux-designer` | inherit | design-system, ux-review, layout-patterns, micro-interactions, mobile-audit | Visual quality, UX evaluation, design polish |
| `backend-dev` | inherit | — | API, migrations, seeders, admin panel |
| `qa-tester` | sonnet | — | Post-change QA, bug finding, translation checks |
| `content-manager` | sonnet | translate | Text updates, CMS content, translation sync |
| `researcher` | haiku | — | Fast codebase lookups, architecture questions |

## Common Commands

```bash
npm run build          # Build frontend (ALWAYS run after changes)
npm run dev            # Dev server with HMR
php artisan migrate    # Run migrations
php artisan tinker     # Interactive PHP REPL for DB queries
php artisan db:seed --class=ProductionSeeder  # Re-seed all data (careful!)
```

## Current Status

- **Phase 1 (complete):** Homepage restructure, branding, navigation, program categories, hero slider, team section, closing line, footer redesign, mobile responsive fixes
- **Phase 2 (blocked on client):** Owner photo, underwater team image, "How We Train" blog page, "Learn to Dive" landing page, program descriptions, statistics update, full Arabic translation pass
