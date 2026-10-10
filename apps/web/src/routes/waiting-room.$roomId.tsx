import { createFileRoute } from '@tanstack/react-router';
import WaitingRoomPage from '../pages/WaitingRoom/WaitingRoomPage';

export const Route = createFileRoute('/waiting-room/$roomId')({ component: WaitingRoomPage });
