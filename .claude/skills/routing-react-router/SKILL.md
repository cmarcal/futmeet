---
name: routing-react-router
description: Use when setting up routes, implementing navigation, adding new pages, or using routing hooks (useNavigate, useParams, useLocation) in the React web app.
---

# Routing with React Router DOM

Use React Router DOM v7 for all client-side routing. Note: `@types/react-router-dom` is bundled in v6+, no separate types package needed.

Install: `npm install react-router-dom`

## Setup

```typescript
// main.tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

```typescript
// App.tsx — all routes defined here
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

## MVP Routes

```
/           → HomePage (landing/create game)
/game       → GamePage (player management)
/results    → ResultsPage (team display)
```

## Navigation Hooks

### useNavigate

```typescript
import { useNavigate } from 'react-router-dom';

function GameManager() {
  const navigate = useNavigate();

  const handleSortComplete = () => navigate('/results');
  const handleGoBack = () => navigate(-1);
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

### useLocation

```typescript
import { useLocation } from 'react-router-dom';

const location = useLocation();
// location.pathname → '/game'
```

## Route Parameters (Future)

```typescript
// Route
<Route path="/game/:gameId" element={<GamePage />} />

// Component
import { useParams } from 'react-router-dom';
const { gameId } = useParams<{ gameId: string }>();
```

## Route Protection (Future)

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Usage
<Route path="/game" element={
  <ProtectedRoute isAuthenticated={isAuthenticated}>
    <GamePage />
  </ProtectedRoute>
} />
```

## Typed Routes (Optional)

```typescript
// types/routes.ts
export type RoutePath = '/' | '/game' | '/results';
const navigate = useNavigate();
navigate('/game' as RoutePath);
```

## Project Structure

```
src/
├── pages/
│   ├── HomePage.tsx
│   ├── GamePage.tsx
│   └── ResultsPage.tsx
├── components/navigation/
│   └── Navigation.tsx
└── App.tsx   ← routes defined here
```

## Best Practices

- Define all routes in `App.tsx` — one place for the full route map
- Keep page components in `src/pages/`
- Use `useNavigate` for programmatic navigation, `Link` for declarative navigation
- Always test browser back/forward buttons after adding routes
