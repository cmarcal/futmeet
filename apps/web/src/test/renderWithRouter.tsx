import { isValidElement, type ReactElement } from 'react';
import { act, render } from '@testing-library/react';
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

interface RenderWithRouterOptions {
  path?: string;
  initialEntry?: string;
}

type RouteElements = Record<string, ReactElement>;

const renderWithRouter = async (
  ui: ReactElement | RouteElements,
  { path = '/', initialEntry = path }: RenderWithRouterOptions = {}
) => {
  const rootRoute = createRootRoute({ component: Outlet });
  const elements: RouteElements = isValidElement(ui) ? { [path]: ui } : ui;
  const uiRoutes = Object.entries(elements).map(([routePath, element]) =>
    createRoute({ getParentRoute: () => rootRoute, path: routePath, component: () => element })
  );
  const fallbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([...uiRoutes, fallbackRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  await router.load();
  const result = render(<RouterProvider router={router} />);
  await act(async () => {
    await router.load();
  });

  return { router, ...result };
};

export { renderWithRouter };
