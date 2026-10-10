import { describe, it, expect } from 'vitest';
import { getRouter } from '../router';
import { LoadingSpinner } from '../components/LoadingSpinner';

const VALID_ID = 'V1StGXR8_Z5jdHi6B-myT';

describe('getRouter', () => {
  it('should create a new router instance on every call', () => {
    expect(getRouter()).not.toBe(getRouter());
  });

  it('should use LoadingSpinner as the default pending component', () => {
    expect(getRouter().options.defaultPendingComponent).toBe(LoadingSpinner);
  });

  it('should define an error component for route failures', () => {
    expect(getRouter().options.defaultErrorComponent).toBeTypeOf('function');
  });

  it('should restore scroll position', () => {
    expect(getRouter().options.scrollRestoration).toBe(true);
  });

  it('should never disable SSR by default', () => {
    expect(getRouter().options.defaultSsr).not.toBe(false);
  });

  it.each([
    ['/', '/'],
    [`/game/${VALID_ID}`, '/game/$gameId'],
    [`/results/${VALID_ID}`, '/results/$gameId'],
    [`/waiting-room/${VALID_ID}`, '/waiting-room/$roomId'],
  ])('should match %s to route %s', async (href, routeId) => {
    const router = getRouter();
    await router.navigate({ href });
    expect(router.state.matches[router.state.matches.length - 1]?.routeId).toBe(routeId);
  });
});
