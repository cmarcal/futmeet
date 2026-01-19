# Frontend Architecture - Final Decisions

## Session Summary
**Date**: Initial Planning Session  
**Focus**: Frontend Structure & Architecture

---

## ✅ Confirmed Decisions

### 1. Framework & Build
**Decision**: **React with TypeScript (client-side, no Next.js)**

**Rationale:**
- MVP focus: unlogged site, simpler setup
- Faster initial development without SSR complexity
- Full control over routing and rendering
- Apply CWA (Component Web App) best practices where applicable

**Key Points:**
- Client-side React application
- TypeScript for type safety
- No Server-Side Rendering (SSR) for MVP
- Future: Can migrate to Next.js if needed

---

### 2. State Management
**Decision**: **Zustand from the beginning**

**Rationale:**
- Planning to scale the project; better to start with a solid framework than refactor later
- Only ~1KB bundle size (minimal overhead)
- Better performance with optimized re-renders
- Great DevTools integration from the start
- Ready for future features (persistence, middleware)

**Key Features:**
- Minimal boilerplate
- Redux DevTools integration
- TypeScript-first
- Middleware support for future needs

**State Persistence:**
- Use Zustand persist middleware for localStorage
- Persist: players, priorityPlayers, teamCount, gameStatus
- Handle storage errors gracefully
- Easy migration to server persistence later (Phase 2+)

---

### 3. Styling Approach
**Decision**: **CSS Modules + Atomic Design Pattern**

**Structure:**
```
templates/        → GameLayout, ResultsLayout
sections/         → PlayerList, PlayerInput, TeamResults
components/       → PlayerCard, FormField, AlertBanner
base-elements/    → Button, Input, Text, Badge, Alert
```

**Rationale:**
- Clear component hierarchy
- Reusable base components
- Type-safe CSS with CSS Modules
- Maintainable and scalable
- Co-located styles with components

**CSS Strategy:**
- CSS Modules for scoped styling
- Design Tokens (M3-inspired) for design system
- CSS Custom Properties generated from tokens
- Global styles for resets and base styles

---

### 4. Form Handling
**Decision**: **React Hook Form + Zod**

**Rationale:**
- Excellent TypeScript integration
- High performance (minimal re-renders)
- Type-safe validation with Zod
- Single source of truth (schema = validation + types)
- Great developer experience

**Installation:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Key Features:**
- Zod schemas generate TypeScript types
- Automatic form validation
- Error handling out of the box
- Accessible form patterns

---

### 5. API Integration
**Decision**: **TanStack Query (React Query) as primary API framework**

**Rationale:**
- Future-proof architecture
- Handles loading/error states automatically
- Intelligent caching and background updates
- Can mock APIs for MVP phase
- Easy migration to real APIs later

**Architecture Split:**
- **TanStack Query**: Server state (API data, caching)
- **Zustand**: Client state (UI state, local game data)

**Implementation Plan:**
- Set up QueryClient provider
- Create API service layer (mock initially)
- Create custom hooks for queries/mutations
- Replace mocks with real APIs when backend ready

---

### 6. Routing
**Decision**: **React Router DOM**

**Rationale:**
- Industry standard for React SPA routing
- Simple API, well-documented
- Full TypeScript support
- Handles browser history and navigation

**Routes:**
- `/` → HomePage (Landing/Create Game)
- `/game` → GamePage (Player Management)
- `/results` → ResultsPage (Team Display)

**Installation:**
```bash
npm install react-router-dom
```

---

### 7. Bundling
**Decision**: **Vite as build tool and bundler**

**Rationale:**
- Lightning-fast development experience (instant HMR)
- Excellent tree-shaking and bundle optimization
- Modern build tool with native ESM support
- Minimal configuration required
- Better performance than webpack-based tools

**Key Features:**
- Fast dev server (< 1 second startup)
- Optimized production builds with Rollup
- Built-in TypeScript support
- CSS Modules support out of the box

---

### 8. Mobile-First Approach
**Decision**: **Mobile-first design and development**

**Rationale:**
- Users are at the field with mobile devices
- Mobile-first forces focus on essential features
- Better performance on mobile networks
- Progressive enhancement for larger screens

**Implementation:**
- Mobile styles as base (no media query)
- Progressive enhancement for tablet (768px+) and desktop (1024px+)
- Touch-optimized interactions (44px minimum touch targets)
- Responsive breakpoints and CSS variables

---

### 9. Error Handling
**Decision**: **Multi-layer error handling strategy**

**Approach:**
- **Error Boundaries**: Catch unexpected runtime errors
- **Form Validation**: React Hook Form + Zod inline errors
- **API Errors**: TanStack Query error handling with user feedback
- **User Messages**: Alert components and error notifications

**Principles:**
- User-friendly error messages
- Always provide recovery options
- Accessibility (ARIA attributes)
- Error logging for debugging

---

### 10. Icon System
**Decision**: **Lucide React**

**Rationale:**
- Modern, tree-shakeable icon library
- Excellent TypeScript support
- Lightweight (only imports used icons)
- Consistent design language
- Active maintenance and large icon set

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```typescript
import { User, Plus, Trash2 } from 'lucide-react';

<Button>
  <Plus size={16} />
  Add Player
</Button>
```

**Key Features:**
- Tree-shakeable (Vite optimizes unused icons)
- TypeScript-first
- Consistent stroke width and style
- Accessible (can add aria-label)

---

### 11. Team Sorting Algorithm
**Decision**: **Round-Robin with Priority Distribution**

**Strategy:**
- **Algorithm**: Round-robin distribution (simple, predictable)
- **Priority Handling**: Priority players distributed first, then fill remaining spots
- **Location**: `utils/teamSorter.ts`

**Implementation Approach:**
1. Sort priority players first (distribute evenly across teams)
2. Distribute remaining players using round-robin
3. Balance team sizes (adjust if uneven)

**Edge Cases:**
- Odd number of players: Allow unbalanced teams or add placeholder
- More teams than players: Error handling (minimum players per team)
- No priority players: Standard round-robin distribution

**Future Enhancements (Phase 2+):**
- Skill-based balancing
- Historical fairness (alternate teams)
- Position preferences

---

### 12. Accessibility
**Decision**: **WCAG 2.1 Level AA Compliance**

**Core Principles:**
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA minimum (4.5:1 for text)
- **Focus Management**: Visible focus indicators, logical tab order
- **Semantic HTML**: Use proper HTML elements (button, nav, main, etc.)

**Implementation:**
- ARIA attributes where needed (role, aria-label, aria-live)
- Keyboard shortcuts for common actions
- Skip to content links
- Focus traps in modals
- Color contrast verification tools

**Testing:**
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast tools (Lighthouse, axe DevTools)

---

### 13. Testing Framework
**Decision**: **Vitest + React Testing Library**

**Rationale:**
- Vitest integrates seamlessly with Vite (same config, faster)
- React Testing Library for component testing
- Excellent TypeScript support
- Fast execution and watch mode
- Jest-compatible API (familiar)

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Coverage:**
- Unit tests: Utilities, hooks, functions
- Component tests: UI components
- Integration tests: Critical user flows

---

## 📁 Project Structure

### Recommended Structure
```
src/
├── components/
│   ├── base-elements/      # Button, Input, Text, Badge, Alert
│   ├── components/          # PlayerCard, FormField, AlertBanner
│   ├── sections/            # PlayerList, PlayerInput, TeamResults
│   └── templates/           # GameLayout, ResultsLayout
├── pages/                   # Page components
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   └── ResultsPage.tsx
├── tokens/                  # Design tokens
│   ├── tokens.json          # Source of truth (JSON)
│   └── tokens.ts            # TypeScript types (generated)
├── stores/                  # Zustand stores
│   └── gameStore.ts
├── hooks/                   # Custom React hooks
│   ├── usePlayerManagement.ts
│   ├── useTeamSorting.ts
│   └── api/                # TanStack Query hooks
├── api/                     # API service layer
│   ├── players.ts
│   ├── teams.ts
│   └── mock/               # Mock APIs for MVP
├── schemas/                 # Zod validation schemas
│   └── playerSchemas.ts
├── utils/                   # Helper functions
│   ├── teamSorter.ts        # Round-robin team sorting algorithm
│   └── priorityManager.ts
├── types/                   # TypeScript types
│   └── index.ts
└── styles/                  # Global styles
    ├── global.css
    ├── tokens.css           # Generated CSS variables from tokens
    └── utilities.css
```

---

## 📦 Dependencies Summary

### Core
- `react` + `react-dom`
- `typescript`
- `@types/react` + `@types/react-dom`

### State Management
- `zustand`

### Forms & Validation
- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### API Integration
- `@tanstack/react-query`
- `@tanstack/react-query-devtools` (dev dependency)

### Routing
- `react-router-dom`

### Error Handling
- `react-error-boundary`

### Icons
- `lucide-react`

### Testing (Dev Dependencies)
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

### Build Tool
- `vite`
- `@vitejs/plugin-react`

### Styling
- CSS Modules (built into Vite)

---

## 🎯 Implementation Priorities

### Phase 1: MVP Foundation
1. ✅ Set up Vite + React + TypeScript project
2. ✅ Configure CSS Modules and mobile-first breakpoints
3. ✅ Set up design tokens structure (tokens.json) and generate CSS variables
4. ✅ Set up project structure (Atomic Design with renamed folders)
5. ✅ Create base elements components (Button, Input, Text, Icon)
6. ✅ Set up Zustand store with persist middleware
7. ✅ Integrate React Router DOM for routing
8. ✅ Integrate React Hook Form + Zod
9. ✅ Set up TanStack Query (with mocks)
10. ✅ Add Error Boundary and basic error handling

### Phase 2: Core Features
1. Build player management components
2. Implement team sorting logic
3. Create team results display
4. Add form validation
5. Implement local storage persistence (via Zustand middleware)

### Phase 3: Polish & Refinement
1. Performance optimization
2. Advanced error handling and logging
3. Testing setup
4. Accessibility improvements

---

## 🔄 Migration Paths

### API Migration (Mock → Real)
**When**: Backend API ready  
**Effort**: Medium (update API service layer)  
**Risk**: Low (TanStack Query abstracts differences)

### Framework Migration (React → Next.js)
**When**: Need SSR, SEO, or advanced routing  
**Effort**: High  
**Risk**: Medium (requires architectural changes)

---

## 📝 Notes & Considerations

### CWA Best Practices
- Keep authentication logic separate
- Component-based architecture
- Prepare for future SSO integration points

### Performance
- Monitor re-renders with React DevTools
- Use React.memo for expensive components
- Vite's tree-shaking will optimize bundle size
- Code splitting via dynamic imports

### Testing Strategy
- **Framework**: Vitest + React Testing Library
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for critical flows
- Accessibility testing (screen readers, keyboard navigation)

---

## 🚦 Open Questions / Future Decisions

1. **Code Quality Tools**: ESLint/Prettier configuration? (Recommended: ESLint + Prettier with React/TypeScript presets)
2. **Deployment**: Hosting platform (Vercel, Netlify, etc.)?
3. **CI/CD**: GitHub Actions, GitLab CI, or other?
4. **Performance Monitoring**: Add analytics/monitoring (Phase 2+)

---

## 📚 Reference Documents

1. `state-management-analysis.md` - Detailed state management comparison + persistence strategy
2. `forms-analysis.md` - React Hook Form + Zod details
3. `tanstack-query-integration.md` - API integration strategy
4. `component-architecture-css-modules.md` - Styling and component architecture
5. `design-tokens-strategy.md` - Design tokens system (M3-inspired)
6. `bundling-vite.md` - Vite bundling and build strategy
7. `routing-strategy.md` - React Router DOM routing strategy
8. `mobile-first-strategy.md` - Mobile-first design and development approach
9. `error-handling-strategy.md` - Comprehensive error handling strategy
10. `testing-strategy.md` - Vitest + React Testing Library strategy
11. `icons-strategy.md` - Lucide React icon system strategy
12. `accessibility-strategy.md` - WCAG 2.1 Level AA accessibility strategy

---

**Status**: ✅ **All Decisions Finalized**  
**Next Steps**: Begin implementation with Phase 1 foundation
