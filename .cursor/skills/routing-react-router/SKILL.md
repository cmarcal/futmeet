---
name: routing-react-router
description: Use React Router DOM for client-side routing. This skill guides implementing routes, navigation, and route configuration following the project's routing strategy.
---

# Routing with React Router DOM

When implementing routing in this project, use React Router DOM. This provides industry-standard client-side routing with TypeScript support.

## When to Use This Skill

- Setting up application routes
- Implementing navigation between pages
- Creating route configuration
- Handling route parameters
- Implementing route protection (future)

## Key Principles

1. **React Router DOM** is the routing library
2. **Declarative Routing**: Define routes using JSX components
3. **Browser History**: Uses browser History API
4. **TypeScript**: Full TypeScript support
5. **Simple API**: Easy to learn and implement

## Installation

```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

## Basic Setup

### BrowserRouter in main.tsx

```typescript
// main.tsx
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Route Configuration

```typescript
// App.tsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ResultsPage } from './pages/ResultsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}
```

## Route Structure

### Required Routes for MVP

```
/                    → HomePage (Landing/Create Game)
/game                → GamePage (Player Management)
/results             → ResultsPage (Team Display)
```

### Future Routes (Phase 2+)

```
/game/:gameId        → Specific game session
/results/:gameId     → Specific game results
/history             → Game history
```

## Navigation Patterns

### useNavigate Hook

```typescript
import { useNavigate } from 'react-router-dom';

function GameManager() {
  const navigate = useNavigate();

  const handleSortComplete = () => {
    navigate('/results');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back in history
  };

  return (
    <div>
      <button onClick={handleSortComplete}>View Results</button>
      <button onClick={handleGoBack}>Back</button>
    </div>
  );
}
```

### Link Component

```typescript
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/game">Game</Link>
      <Link to="/results">Results</Link>
    </nav>
  );
}
```

### useLocation Hook

```typescript
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  
  return (
    <header>
      <h1>FutMeet</h1>
      <p>Current page: {location.pathname}</p>
    </header>
  );
}
```

## Route Parameters (Future)

### Dynamic Routes

```typescript
// Route configuration
<Route path="/game/:gameId" element={<GamePage />} />

// Component usage
import { useParams } from 'react-router-dom';

function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  
  return <div>Game ID: {gameId}</div>;
}
```

## Route Protection (Future)

### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Usage
<Route path="/game" element={
  <ProtectedRoute isAuthenticated={isAuthenticated}>
    <GamePage />
  </ProtectedRoute>
} />
```

## TypeScript Support

### Typed Routes (Optional)

```typescript
// types/routes.ts
export type RoutePath = '/' | '/game' | '/results';

// Usage with type safety
const navigate = useNavigate();
navigate('/game' as RoutePath);
```

## Project Structure

### Recommended Structure

```
src/
├── pages/
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   └── ResultsPage.tsx
├── components/
│   └── navigation/
│       └── Navigation.tsx
└── App.tsx (Routes configuration)
```

## Best Practices

1. **Declarative Routes**: Define routes in one place (App.tsx)
2. **Route Components**: Keep route components in `pages/` directory
3. **Navigation Components**: Keep navigation in `components/navigation/`
4. **Type Safety**: Use TypeScript for route paths and params
5. **Browser History**: Test browser back/forward buttons

## Related Files

- `adr/frontend/01-frontend-architecture/routing-strategy.md` - Full routing documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Routing decision

## Checklist

- [ ] Install `react-router-dom`
- [ ] Set up `BrowserRouter` in main.tsx
- [ ] Configure routes in App.tsx
- [ ] Create navigation component
- [ ] Implement route navigation hooks
- [ ] Test browser back/forward buttons
- [ ] Add route protection if needed (future)
