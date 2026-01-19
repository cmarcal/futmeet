# Routing Strategy: React Router DOM

## Overview
Using React Router DOM for client-side routing in the FutMeet MVP.

---

## What is React Router DOM?

### Definition
Industry-standard routing library for React applications. Handles navigation, URL management, and browser history.

### Key Features
- **Declarative Routing**: Define routes using JSX components
- **Browser History**: Uses browser History API for navigation
- **Nested Routes**: Support for complex routing structures
- **Route Parameters**: Dynamic URL parameters and query strings
- **Programmatic Navigation**: Navigate programmatically with hooks
- **TypeScript**: Excellent TypeScript support

---

## Why React Router DOM for Your Project?

### Benefits ✅
1. **Industry Standard**: Most popular routing solution for React
2. **Simple API**: Easy to learn and implement
3. **Browser Integration**: Proper URL handling and browser back/forward
4. **TypeScript**: Full TypeScript support
5. **Lightweight**: ~7KB gzipped
6. **Well Maintained**: Active development, large community

---

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
/history             → Game history (future)
```

---

## Implementation

### Installation
```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

### Basic Setup
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

### Navigation Hooks
```typescript
// Component example
import { useNavigate, useLocation } from 'react-router-dom';

function GameManager() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSortComplete = () => {
    navigate('/results');
  };

  return (
    <div>
      <button onClick={handleSortComplete}>View Results</button>
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

---

## TypeScript Support

### Typed Routes (Optional)
```typescript
// types/routes.ts
export type RoutePath = '/' | '/game' | '/results';

// Usage with type safety
const navigate = useNavigate();
navigate('/game' as RoutePath);
```

---

## Route Protection (Future)

### Private Routes Example
```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = false; // Check auth state
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Usage
<Route path="/game" element={
  <ProtectedRoute>
    <GamePage />
  </ProtectedRoute>
} />
```

---

## Project Structure Integration

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

---

## Decision Summary

✅ **Use React Router DOM for routing**

**Benefits:**
- Industry standard, well-documented
- Simple API, easy to learn
- Full TypeScript support
- Proper browser history integration
- Lightweight (~7KB)

**Routes:**
- `/` → HomePage
- `/game` → GamePage
- `/results` → ResultsPage

---

## Checklist

- [ ] Install `react-router-dom`
- [ ] Set up `BrowserRouter` in main.tsx
- [ ] Configure routes in App.tsx
- [ ] Create navigation component
- [ ] Implement route navigation hooks
- [ ] Test browser back/forward buttons
- [ ] Add route protection if needed (future)
