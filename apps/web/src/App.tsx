import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const GamePage = lazy(() => import('./pages/Game/GamePage'));
const ResultsPage = lazy(() => import('./pages/Results/ResultsPage'));
const WaitingRoomPage = lazy(() => import('./pages/WaitingRoom/WaitingRoomPage'));

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/results/:gameId" element={<ResultsPage />} />
          <Route path="/waiting-room/:roomId" element={<WaitingRoomPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
