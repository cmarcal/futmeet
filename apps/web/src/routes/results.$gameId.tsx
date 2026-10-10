import { createFileRoute } from '@tanstack/react-router';
import ResultsPage from '../pages/Results/ResultsPage';

export const Route = createFileRoute('/results/$gameId')({ component: ResultsPage });
