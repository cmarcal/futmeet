import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HomePage, GamePage, ResultsPage } from './pages'

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/results/:gameId" element={<ResultsPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
