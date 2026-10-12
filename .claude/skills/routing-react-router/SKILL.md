---
name: routing-react-router
description: Use when setting up routes, adding pages, or navigating with routing hooks in the React web app.
---

# Routing with React Router DOM

React Router DOM v7 handles all client-side routing. Types are bundled; no `@types` package needed.

## Rules

- Define every route in `App.tsx`, one place for the full route map
- Page components live in `src/pages/`
- `useNavigate` for programmatic navigation, `Link` for declarative navigation
- `BrowserRouter` wraps `<App />` in `main.tsx`
- After adding routes, test the browser back/forward buttons

## MVP Routes

```
/           → HomePage (landing/create game)
/game       → GamePage (player management)
/results    → ResultsPage (team display)
```

## Setup

```typescript
// App.tsx
export const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/game" element={<GamePage />} />
    <Route path="/results" element={<ResultsPage />} />
  </Routes>
);
```

## Navigation

```typescript
const navigate = useNavigate();
const handleSortComplete = () => navigate('/results');
const handleGoBack = () => navigate(-1);

<Link to="/game">Game</Link>
```

## Route Parameters

```typescript
<Route path="/game/:gameId" element={<GamePage />} />

const { gameId } = useParams<{ gameId: string }>();
```

## Project Structure

```
src/
├── pages/{HomePage,GamePage,ResultsPage}.tsx
├── components/navigation/Navigation.tsx
└── App.tsx
```

## References

Read `references/examples.md` for `main.tsx` setup, `useLocation`, `ProtectedRoute` and typed routes.
