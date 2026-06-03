import { useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

/**
 * Wraps <Outlet /> with a subtle staggered fade+slide-up on every route change.
 * Also resets the parent scroll container to the top on every navigation.
 *
 * Does NOT interfere with the dashboard/sidebar login entrance animation —
 * those are controlled separately via the 'just_logged_in' sessionStorage flag.
 */
export default function PageTransition() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the closest scrollable ancestor (the <main> element) back to top
    const el = ref.current?.closest('main') ?? ref.current?.parentElement;
    if (el) el.scrollTop = 0;
  }, [pathname]);

  return (
    <div ref={ref} key={pathname} className="page-enter" style={{ height: '100%' }}>
      <Outlet />
    </div>
  );
}
