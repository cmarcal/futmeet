import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
