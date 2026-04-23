import React, { startTransition, useCallback, forwardRef } from 'react';
import { Link, type LinkProps, useNavigate } from 'react-router-dom';
import { prefetchRoute } from '../../utils/prefetchRoute';

/**
 * Drop-in replacement for react-router's <Link> that:
 *
 * 1. Prefetches the target route (JS chunk + RTK Query data) on
 *    hover / focus / touchstart so navigation is warm by click time.
 * 2. Wraps the navigation in React.startTransition so the OLD page
 *    remains visible while the new page resolves, instead of Suspense
 *    briefly showing a skeleton. Perceived as instant navigation.
 *
 * Use for all internal `<Link>` usages in the app where you'd normally
 * reach for react-router's Link.
 */
export const FastLink = forwardRef<HTMLAnchorElement, LinkProps>(function FastLink(
  { to, onMouseEnter, onFocus, onTouchStart, onClick, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const href = typeof to === 'string' ? to : (to as { pathname?: string }).pathname ?? '';

  const warm = useCallback(() => {
    if (href) prefetchRoute(href);
  }, [href]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      // Let the browser handle modified clicks (cmd/ctrl/shift/middle-click)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      // Start the prefetch first so the query is in-flight before we navigate.
      warm();
      // Keep the old page mounted while the new page + data resolve.
      startTransition(() => {
        navigate(to as string);
      });
    },
    [onClick, to, navigate, warm],
  );

  return (
    <Link
      ref={ref}
      to={to}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      onClick={handleClick}
      {...rest}
    />
  );
});
