import { createFileRoute, redirect } from '@tanstack/react-router';
import WaitingRoomPage from '../pages/WaitingRoom/WaitingRoomPage';
import { isValidGameId } from '../utils/gameId';
import { buildHead } from '../utils/routeHead';

export const Route = createFileRoute('/waiting-room/$roomId')({
  ssr: true,
  beforeLoad: ({ params }) => {
    if (!isValidGameId(params.roomId)) throw redirect({ to: '/', replace: true });
  },
  head: () => buildHead('Sala de Espera | FutMeet', 'Confirme sua presença na pelada: adicione seu nome na sala de espera do FutMeet.'),
  component: WaitingRoomPage,
});
