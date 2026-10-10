import { describe, it, expect } from 'vitest';
import { isRedirect } from '@tanstack/react-router';
import { Route as IndexRoute } from '../../routes/index';
import { Route as GameRoute } from '../../routes/game.$gameId';
import { Route as ResultsRoute } from '../../routes/results.$gameId';
import { Route as WaitingRoomRoute } from '../../routes/waiting-room.$roomId';

const VALID_ID = 'V1StGXR8_Z5jdHi6B-myT';

type BeforeLoad = (ctx: { params: Record<string, string> }) => void;

const runBeforeLoad = (route: { options: { beforeLoad?: unknown } }, params: Record<string, string>) =>
  (route.options.beforeLoad as BeforeLoad)({ params });

describe('client-only routes', () => {
  it.each([
    ['/', IndexRoute],
    ['/game/$gameId', GameRoute],
  ])('should disable SSR on %s', (_path, route) => {
    expect(route.options.ssr).toBe(false);
  });
});

describe('shareable SSR routes', () => {
  it.each([
    ['/results/$gameId', ResultsRoute],
    ['/waiting-room/$roomId', WaitingRoomRoute],
  ])('should render %s on the server', (_path, route) => {
    expect(route.options.ssr).toBe(true);
  });

  it.each([
    ['Resultado dos Times | FutMeet', ResultsRoute],
    ['Sala de Espera | FutMeet', WaitingRoomRoute],
  ])('should expose the title "%s" and Open Graph tags', (title, route) => {
    const head = (route.options.head as () => { meta: Record<string, string>[] })();
    expect(head.meta).toContainEqual({ title });
    expect(head.meta).toContainEqual({ property: 'og:title', content: title });
  });

  it('should redirect an invalid results id to home', () => {
    try {
      runBeforeLoad(ResultsRoute, { gameId: 'bad' });
      expect.unreachable();
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect((error as { options: { to: string } }).options.to).toBe('/');
    }
  });

  it('should redirect an invalid waiting room id to home', () => {
    try {
      runBeforeLoad(WaitingRoomRoute, { roomId: 'bad' });
      expect.unreachable();
    } catch (error) {
      expect(isRedirect(error)).toBe(true);
      expect((error as { options: { to: string } }).options.to).toBe('/');
    }
  });

  it('should accept a valid id without redirecting', () => {
    expect(() => runBeforeLoad(ResultsRoute, { gameId: VALID_ID })).not.toThrow();
    expect(() => runBeforeLoad(WaitingRoomRoute, { roomId: VALID_ID })).not.toThrow();
  });
});
