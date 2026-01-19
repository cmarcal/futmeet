# FutMeet MVP - Project Planning Document

## 📋 Project Overview

**Goal**: Build an MVP website to help casual football players organize pickup games by managing participant lists, prioritizing certain players, and automatically sorting them into teams.

**Core Features (MVP)**:
- Add players to a list (in order of arrival)
- Assign priority to specific players
- Sort the final list into X teams (determined by host)

---

## 🏗️ Frontend Structure & Architecture

> **Note**: This section reflects the architectural decisions documented in `adr/frontend/01-frontend-architecture/`. See implementation steps below for detailed setup instructions.

### 1. Application Architecture

#### **Confirmed Tech Stack** (from ADR decisions)
- **Framework**: React with TypeScript (client-side only, no Next.js)
- **State Management**: Zustand (from the beginning, with persist middleware)
- **Styling**: CSS Modules + Atomic Design Pattern
- **Form Handling**: React Hook Form + Zod validation
- **API Integration**: TanStack Query (React Query) with mocks for MVP
- **Routing**: React Router DOM
- **Bundling**: Vite as build tool and bundler
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Design System**: Design Tokens (M3-inspired) with CSS Custom Properties

#### **Project Structure** (from ADR decisions)
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

### 2. Component Hierarchy

```
App
├── Header (navigation, host info)
├── GameManager (main container)
│   ├── PlayerInput (add new players)
│   ├── PlayerList (ordered list with priority indicators)
│   │   └── PlayerItem (individual player with actions)
│   ├── PriorityManager (select/assign priority players)
│   ├── TeamSettings (configure number of teams)
│   └── SortButton (trigger team sorting)
└── ResultsView (after sorting)
    └── TeamList
        └── TeamCard (displays players in each team)
```

### 3. State Management Structure

**Technology**: Zustand with persist middleware for localStorage

**Core State Shape**:
```typescript
{
  players: Player[]           // Ordered list with metadata
  priorityPlayers: string[]   // IDs of priority players
  teams: Team[]              // After sorting
  teamCount: number          // X teams (default: 2)
  gameStatus: 'setup' | 'sorting' | 'complete'
}
```

**Player Object**:
```typescript
{
  id: string
  name: string
  timestamp: Date           // Arrival order
  priority: boolean
  notes?: string
}
```

---

## 🎨 UX/UI Design Ideas

### 1. User Flow

#### **Primary Flow (Host)**:
1. **Landing Page** → Create new game session
2. **Player Management** → Add players as they arrive
3. **Priority Assignment** → Mark key players (optional)
4. **Team Configuration** → Set number of teams
5. **Sort & Display** → Generate teams and show results
6. **Share Results** → Export/share team composition

#### **Secondary Flow (Participant)**:
1. **Join Game** → Enter game code/QR
2. **Add Self** → Add name to list
3. **View Status** → See current list position
4. **View Teams** → See final teams (when ready)

### 2. UI Design Patterns

#### **Player List Display**:
- **Visual Priority Indicators**:
  - Badge/icon for priority players
  - Color coding (e.g., gold for priority, standard for others)
  - Order numbers with emphasis on priority positions
- **Drag & Drop** (Future): Reorder players manually
- **Real-time Updates**: List updates as players join

#### **Team Results View**:
- **Card-based Layout**: Each team in a distinct card
- **Color Differentiation**: Different colors per team
- **Player Count**: Show player distribution
- **Balance Indicator**: Visual representation of team size equality
- **Export Options**: Copy to clipboard, print, share link

#### **Interaction Patterns**:
- **Quick Add**: Keyboard shortcut to add players quickly
- **Bulk Operations**: Add multiple players at once
- **Undo/Redo**: History for accidental removals
- **Confirmation Dialogs**: For critical actions (clear list, reset)

### 3. Responsive Design Considerations

- **Mobile-First**: Many users will be on mobile at the field
- **Large Touch Targets**: Easy tap interactions on mobile
- **Offline Capability**: Basic functionality works without internet
- **QR Code Integration**: Quick game session access
- **Portrait/Landscape**: Adapt to phone orientation

### 4. Visual Design Suggestions

#### **Color Palette**:
- Primary: Football field green (#2E7D32)
- Accent: Sporty orange/red (#FF6B35)
- Neutral: Clean grays/whites
- Priority: Gold/Yellow (#FFC107)

#### **Typography**:
- Headers: Bold, sporty font (e.g., Montserrat, Poppins)
- Body: Clean, readable sans-serif

#### **Icons**:
- Player icons, team icons, priority badges
- Material Icons or Font Awesome

---

## 📈 Scalability Possibilities

### 1. Technical Scalability

#### **Performance Optimization**:
- **Code Splitting**: Lazy load routes/components
- **Virtual Scrolling**: Handle large player lists efficiently
- **Memoization**: Optimize re-renders with React.memo, useMemo
- **Progressive Web App (PWA)**: Installable, works offline
- **Caching Strategy**: Cache game sessions in localStorage/IndexedDB

#### **Database & Backend** (Future):
- **Firebase/Supabase**: Real-time updates, multi-user sessions
- **PostgreSQL/MongoDB**: Store game history, statistics
- **API Architecture**: REST or GraphQL for flexible data access
- **CDN**: Serve static assets globally

#### **Real-time Features** (Future):
- **WebSockets**: Live updates when players join
- **Multi-device Sync**: Host and participants see same state
- **Conflict Resolution**: Handle simultaneous edits

### 2. User Scalability

#### **Multi-game Management**:
- **Session History**: Save/load previous games
- **Game Templates**: Pre-configured team setups
- **Multiple Hosts**: Shared hosting capabilities
- **Player Profiles**: Recurring player management

#### **Integration Possibilities**:
- **Calendar Integration**: Schedule games in advance
- **Payment Integration**: Fee collection (e.g., field rental)
- **Weather API**: Auto-notifications for weather conditions
- **Map Integration**: Location-based field finding

### 3. Data Scalability

#### **Storage Strategy**:
- **MVP**: localStorage (client-side only)
- **Phase 2**: Cloud database (Firebase, Supabase)
- **Phase 3**: Dedicated backend with data analytics

#### **Analytics & Insights**:
- **Usage Statistics**: Track popular features
- **Performance Metrics**: Monitor app performance
- **User Behavior**: Understand user patterns

---

## 🚀 Future Feature Roadmap

### **Phase 2: Enhanced Player Management**

1. **Player Profiles**
   - Save recurring players
   - Skill level ratings
   - Position preferences
   - Attendance history

2. **Advanced Sorting Algorithms**
   - Balance by skill level
   - Balance by position
   - Friend groups (keep together or split)
   - Historical fairness (alternate teams)

3. **Waitlist Management**
   - Max player limit with waitlist
   - Substitutions when players leave

### **Phase 3: Social & Community Features**

1. **Game History**
   - Track past games
   - Win/loss statistics
   - Player performance over time

2. **Notifications**
   - Reminders for upcoming games
   - Game status updates
   - Team assignment notifications

3. **Group Chat/Messaging**
   - In-game communication
   - Game reminders
   - Social coordination

### **Phase 4: Advanced Features**

1. **Tournament Mode**
   - Bracket generation
   - Round-robin scheduling
   - Championship tracking

2. **Statistics Dashboard**
   - Individual player stats
   - Team performance metrics
   - Attendance tracking
   - Game frequency analysis

3. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Better offline experience

4. **Monetization Features** (Optional)
   - Premium features (advanced stats, unlimited history)
   - Subscription tiers
   - Ad-free experience

5. **Integration Features**
   - Export to Google Calendar
   - Share on social media
   - Email invitations
   - SMS notifications

### **Phase 5: Platform Expansion**

1. **Multi-sport Support**
   - Basketball, volleyball, etc.
   - Sport-specific customization

2. **Venue Management**
   - Field booking integration
   - Venue ratings/reviews
   - Location-based recommendations

3. **Community Building**
   - Find local pickup games
   - Player matching (find games/players)
   - League organization tools

---

## 📝 MVP Priority Features Checklist

### **Must Have (MVP)**:
- [ ] Add player to list (with name input)
- [ ] Display ordered player list
- [ ] Mark/unmark priority players
- [ ] Set number of teams (X)
- [ ] Sort players into teams
- [ ] Display team results
- [ ] Remove players from list
- [ ] Clear/reset game

### **Nice to Have (MVP+)**:
- [ ] Edit player names
- [ ] Player notes/comments
- [ ] Export teams (copy text)
- [ ] Responsive mobile design
- [ ] Keyboard shortcuts
- [ ] Undo last action

### **Future Enhancements**:
- [ ] Save game sessions
- [ ] Multi-user real-time sync
- [ ] Player profiles/history
- [ ] Advanced sorting algorithms
- [ ] Statistics tracking

---

## 🎯 Implementation Priorities

Based on the frontend architecture decisions documented in `adr/frontend/01-frontend-architecture/`, the following implementation phases and steps are recommended:

### Phase 1: MVP Foundation

1. **Set up Vite + React + TypeScript project**
   - Initialize Vite project with React and TypeScript template
   - Configure project structure and base configuration files

2. **Configure CSS Modules and mobile-first breakpoints**
   - Set up CSS Modules support in Vite
   - Define mobile-first responsive breakpoints
   - Configure global CSS reset and base styles

3. **Set up design tokens structure (tokens.json) and generate CSS variables**
   - Create design tokens JSON file (M3-inspired design system)
   - Generate CSS custom properties from tokens
   - Set up token generation script/process

4. **Set up project structure (Atomic Design with renamed folders)**
   - Create component folder structure: `base-elements/`, `components/`, `sections/`, `templates/`
   - Set up supporting folders: `pages/`, `stores/`, `hooks/`, `api/`, `schemas/`, `utils/`, `types/`, `tokens/`, `styles/`

5. **Create base elements components (Button, Input, Text, Icon)**
   - Implement Button component with variants
   - Implement Input component with validation states
   - Implement Text component with typography variants
   - Integrate Lucide React icons

6. **Set up Zustand store with persist middleware**
   - Create gameStore with initial state structure
   - Configure persist middleware for localStorage
   - Implement player and team management actions

7. **Integrate React Router DOM for routing**
   - Set up router configuration
   - Create routes: `/` (HomePage), `/game` (GamePage), `/results` (ResultsPage)
   - Implement navigation between pages

8. **Integrate React Hook Form + Zod**
   - Install and configure React Hook Form with Zod resolver
   - Create Zod validation schemas for player forms
   - Set up form error handling and validation

9. **Set up TanStack Query (with mocks)**
   - Install TanStack Query and set up QueryClient provider
   - Create mock API service layer
   - Set up custom hooks for API queries/mutations

10. **Add Error Boundary and basic error handling**
    - Implement React Error Boundary component
    - Set up error handling for forms (React Hook Form errors)
    - Configure error handling for API calls (TanStack Query)
    - Add user-friendly error messages and recovery options

### Phase 2: Core Features

1. **Build player management components**
   - Create PlayerInput component for adding players
   - Create PlayerList component with ordered display
   - Create PlayerCard component for individual players
   - Implement priority marking functionality

2. **Implement team sorting logic**
   - Create team sorting algorithm (round-robin with priority distribution)
   - Implement teamSorter utility function
   - Handle edge cases (odd players, more teams than players)

3. **Create team results display**
   - Create TeamResults section component
   - Create TeamCard component for displaying teams
   - Implement team visualization with color differentiation

4. **Add form validation**
   - Implement form validation for player input
   - Add team count validation
   - Provide inline validation feedback

5. **Implement local storage persistence (via Zustand middleware)**
   - Ensure Zustand persist middleware is working correctly
   - Test persistence across page refreshes
   - Handle storage errors gracefully

### Phase 3: Polish & Refinement

1. **Performance optimization**
   - Monitor re-renders with React DevTools
   - Apply React.memo for expensive components
   - Optimize bundle size with Vite tree-shaking
   - Implement code splitting for routes

2. **Advanced error handling and logging**
   - Enhance error boundaries with logging
   - Add error tracking (optional: Sentry integration)
   - Improve error messages for better UX

3. **Testing setup**
   - Set up Vitest configuration
   - Configure React Testing Library
   - Write unit tests for utilities and hooks
   - Write component tests for UI components
   - Write integration tests for critical user flows

4. **Accessibility improvements**
   - Implement ARIA attributes where needed
   - Ensure keyboard navigation for all interactive elements
   - Test with screen readers (NVDA, JAWS, VoiceOver)
   - Verify color contrast (WCAG 2.1 AA compliance)
   - Add focus management for modals and dialogs

---

## 🎯 Key Design Decisions to Consider

1. **Scope**: Keep MVP minimal—focus on core sorting functionality
2. **Platform**: Web-first (mobile-responsive) or native app?
3. **Persistence**: Client-side only (MVP) or cloud-based?
4. **Real-time**: Single-user (MVP) or multi-user collaboration?
5. **Sorting Logic**: Simple round-robin or skill-based balancing?
6. **Access Control**: Public games or private game codes?
7. **Offline Support**: How critical is offline functionality?

---

## 📚 Technical Research Topics

Before starting implementation, research:
- Team sorting algorithms (round-robin, skill-balancing, etc.)
- Priority queue data structures
- State management patterns (Context vs. Redux vs. Zustand)
- PWA implementation (service workers, caching)
- Local storage limitations and best practices
- Real-time synchronization strategies (if planning multi-user)

---

## 🎨 Design Tools & Resources

- **Figma/FigmaJam**: UI mockups and planning
- **Miro/Mural**: Collaborative brainstorming
- **User Story Mapping**: Define user journeys
- **Wireframing Tools**: Low-fidelity prototypes

---

**Document Version**: 1.0  
**Last Updated**: Planning Phase  
**Status**: Ready for FigJam Integration
