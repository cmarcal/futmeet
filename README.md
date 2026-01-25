# FutMeet

A website to help casual football players organize pickup games by managing participant lists, prioritizing certain players, and automatically sorting them into balanced teams.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with persist middleware
- **Styling**: CSS Modules with CSS Variables for design tokens
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm

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

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Testing

Tests are written with Vitest and React Testing Library. Focus on testing critical paths.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## CI/CD

GitHub Actions automatically runs on all pull requests:

- **Lint**: ESLint with zero warnings allowed
- **Test**: Vitest tests
- **Build**: TypeScript compilation and Vite build

All checks must pass before merging to `main`.

## Project Structure

```
src/
├── components/          # React components
│   ├── Alert/          # Alert component
│   ├── Badge/          # Badge component
│   ├── Button/         # Button component
│   ├── ErrorBoundary/  # Error boundary components
│   ├── Input/          # Input component
│   └── Layout/         # Layout component
├── pages/              # Page components
├── stores/             # Zustand stores
├── schemas/            # Zod validation schemas
├── utils/              # Helper functions
├── types/              # TypeScript types
├── styles/             # Global styles and tokens
└── test/               # Test setup
```

## Documentation

- **Architecture Decisions**: See `adr/frontend/01-frontend-architecture/`
- **Project Plan**: See `adr/frontend/PROJECT_PLAN.md`
- **Skills**: See `.cursor/skills/` for development guidelines

## License

Private project
