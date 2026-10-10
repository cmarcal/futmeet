import { createFileRoute, redirect } from '@tanstack/react-router';
import ResultsPage from '../pages/Results/ResultsPage';
import { isValidGameId } from '../utils/gameId';
import { buildHead } from '../utils/routeHead';

export const Route = createFileRoute('/results/$gameId')({
  ssr: true,
  beforeLoad: ({ params }) => {
    if (!isValidGameId(params.gameId)) throw redirect({ to: '/', replace: true });
  },
  head: () => buildHead('Resultado dos Times | FutMeet', 'Veja como os times foram sorteados no FutMeet.'),
  component: ResultsPage,
});
