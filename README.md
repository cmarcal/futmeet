# FutMeet

A website to help casual football players organize pickup games by managing participant lists, prioritizing certain players, and automatically sorting them into balanced teams.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (to be added)
- **Styling**: CSS Modules + Atomic Design Pattern
- **Form Handling**: React Hook Form + Zod (to be added)
- **API Integration**: TanStack Query (to be added)
- **Routing**: React Router DOM (to be added)
- **Icons**: Lucide React (to be added)

## Project Structure

```
src/
├── components/
│   ├── base-elements/      # Button, Input, Text, Badge, Alert
│   ├── components/          # PlayerCard, FormField, AlertBanner
│   ├── sections/            # PlayerList, PlayerInput, TeamResults
│   └── templates/           # GameLayout, ResultsLayout
├── pages/                   # Page components
├── tokens/                  # Design tokens
├── stores/                  # Zustand stores
├── hooks/                   # Custom React hooks
├── api/                     # API service layer
├── schemas/                 # Zod validation schemas
├── utils/                   # Helper functions
├── types/                   # TypeScript types
└── styles/                  # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Documentation

- **Architecture Decisions**: See `adr/frontend/01-frontend-architecture/`
- **Project Plan**: See `adr/frontend/PROJECT_PLAN.md`
- **Design Specifications**: See `adr/design/LOVABLE_DESIGN_PROMPT.md`

## License

Private project
