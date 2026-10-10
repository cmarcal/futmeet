import { describe, it, expect } from 'vitest';
import { router } from '../router';
import { LoadingSpinner } from '../components/LoadingSpinner';

const VALID_ID = 'V1StGXR8_Z5jdHi6B-myT';

describe('router', () => {
  it('should use LoadingSpinner as the default pending component', () => {
    expect(router.options.defaultPendingComponent).toBe(LoadingSpinner);
  });

  it('should define an error component for route failures', () => {
    expect(router.options.defaultErrorComponent).toBeTypeOf('function');
  });

  it.each([
    ['/', '/'],
    [`/game/${VALID_ID}`, '/game/$gameId'],
    [`/results/${VALID_ID}`, '/results/$gameId'],
    [`/waiting-room/${VALID_ID}`, '/waiting-room/$roomId'],
  ])('should match %s to route %s', async (href, routeId) => {
    await router.navigate({ href });
    expect(router.state.matches[router.state.matches.length - 1]?.routeId).toBe(routeId);
  });
});
