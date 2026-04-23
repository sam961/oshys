import { store } from '../store';
import { api } from '../services/api';

/**
 * Route prefetching helpers.
 *
 * For each public route we can prefetch:
 *   1. `chunk`  — the lazy JS bundle for the page component
 *                 (warms the dynamic `import()` cache)
 *   2. `warm`   — an optional RTK Query prefetch so data is already in the
 *                 cache by the time the component mounts
 *
 * Called on hover / focus / touchstart of internal nav links so navigation
 * feels instant.
 */
type RoutePrefetcher = {
  chunk: () => Promise<unknown>;
  warm?: () => void;
};

// NOTE: pages are exported as *named* exports, so we don't bother resolving
// the module here — we only care about the network fetch + parse side effect.
export const routePrefetchers: Record<string, RoutePrefetcher> = {
  '/': {
    chunk: () => import('../pages/HomePage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getHomeData', undefined, { force: false }));
    },
  },
  '/about': {
    chunk: () => import('../pages/AboutPage'),
  },
  '/blog': {
    chunk: () => import('../pages/BlogPage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getBlogPosts', { published: true }, { force: false }));
    },
  },
  '/initiatives': {
    chunk: () => import('../pages/InitiativesPage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getSocialInitiatives', { published: true }, { force: false }));
    },
  },
  '/contact': {
    chunk: () => import('../pages/ContactPage'),
  },
  '/shop/courses': {
    chunk: () => import('../pages/CoursesPage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getCourses', { active: true }, { force: false }));
    },
  },
  '/shop/trips': {
    chunk: () => import('../pages/TripsPage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getTrips', { active: true }, { force: false }));
    },
  },
  '/events': {
    chunk: () => import('../pages/EventsPage'),
    warm: () => {
      store.dispatch(api.util.prefetch('getEvents', { active: true }, { force: false }));
    },
  },
  // Note: the app router exposes the FAQ page at `/faqs`, but some links
  // (e.g. the footer) still point to `/faq`. Register both so prefetch
  // works regardless of which variant is clicked.
  '/faq': {
    chunk: () => import('../pages/FAQPage'),
  },
  '/faqs': {
    chunk: () => import('../pages/FAQPage'),
  },
};

const prefetchedPaths = new Set<string>();

/**
 * Prefetch the JS chunk + initial data for a route. Fire-and-forget.
 * Safe to call many times — each path only prefetches once per session.
 */
export function prefetchRoute(path: string): void {
  if (!path || prefetchedPaths.has(path)) return;

  const prefetcher = routePrefetchers[path];
  if (!prefetcher) return;

  prefetchedPaths.add(path);

  // Chunk import is async; if it fails (network blip) allow a retry later.
  prefetcher.chunk().catch(() => {
    prefetchedPaths.delete(path);
  });

  // Data prefetch is non-blocking via RTK Query's util.prefetch.
  try {
    prefetcher.warm?.();
  } catch {
    // Data prefetch must never throw into a hover handler.
  }
}
