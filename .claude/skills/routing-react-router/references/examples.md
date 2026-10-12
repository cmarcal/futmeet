# Routing Examples

## main.tsx

```typescript
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

## Navigation component

```typescript
export const Navigation = () => (
  <nav>
    <Link to="/">Home</Link>
    <Link to="/game">Game</Link>
    <Link to="/results">Results</Link>
  </nav>
);
```

## useLocation

```typescript
const location = useLocation();
// location.pathname → '/game'
```

## Route protection (future)

```typescript
const ProtectedRoute = ({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

<Route path="/game" element={
  <ProtectedRoute isAuthenticated={isAuthenticated}>
    <GamePage />
  </ProtectedRoute>
} />
```

## Typed routes (optional)

```typescript
export type RoutePath = '/' | '/game' | '/results';
navigate('/game' as RoutePath);
```
