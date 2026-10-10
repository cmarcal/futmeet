import { createFileRoute } from '@tanstack/react-router';
import GamePage from '../pages/Game/GamePage';

export const Route = createFileRoute('/game/$gameId')({ component: GamePage });
