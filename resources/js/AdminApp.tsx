import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PageLoader } from './components/ui/PageLoader';
import { ProtectedRoute } from './admin/components/ProtectedRoute';

// Admin pages — lazy-loaded so each page ships as its own chunk.
// This keeps the initial admin bundle small: only the login page and the
// AdminLayout chrome need to load up-front when the admin first hits /admin.
const LoginPage = React.lazy(() =>
  import('./admin/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const AdminLayout = React.lazy(() =>
  import('./admin/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const Dashboard = React.lazy(() =>
  import('./admin/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const ProductsManagement = React.lazy(() =>
  import('./admin/pages/ProductsManagement').then((m) => ({ default: m.ProductsManagement }))
);
const ProductEditPage = React.lazy(() =>
  import('./admin/pages/ProductEditPage').then((m) => ({ default: m.ProductEditPage }))
);
const CoursesManagement = React.lazy(() =>
  import('./admin/pages/CoursesManagement').then((m) => ({ default: m.CoursesManagement }))
);
const CourseEditPage = React.lazy(() =>
  import('./admin/pages/CourseEditPage').then((m) => ({ default: m.CourseEditPage }))
);
const TripsManagement = React.lazy(() =>
  import('./admin/pages/TripsManagement').then((m) => ({ default: m.TripsManagement }))
);
const TripEditPage = React.lazy(() =>
  import('./admin/pages/TripEditPage').then((m) => ({ default: m.TripEditPage }))
);
const BlogManagement = React.lazy(() =>
  import('./admin/pages/BlogManagement').then((m) => ({ default: m.BlogManagement }))
);
const BlogEditPage = React.lazy(() =>
  import('./admin/pages/BlogEditPage').then((m) => ({ default: m.BlogEditPage }))
);
const EventsManagement = React.lazy(() =>
  import('./admin/pages/EventsManagement').then((m) => ({ default: m.EventsManagement }))
);
const EventEditPage = React.lazy(() =>
  import('./admin/pages/EventEditPage').then((m) => ({ default: m.EventEditPage }))
);
const TeamManagement = React.lazy(() =>
  import('./admin/pages/TeamManagement').then((m) => ({ default: m.TeamManagement }))
);
const TeamMemberEditPage = React.lazy(() =>
  import('./admin/pages/TeamMemberEditPage').then((m) => ({ default: m.TeamMemberEditPage }))
);
const BannerManagement = React.lazy(() =>
  import('./admin/pages/BannerManagement').then((m) => ({ default: m.BannerManagement }))
);
const BannerEditPage = React.lazy(() =>
  import('./admin/pages/BannerEditPage').then((m) => ({ default: m.BannerEditPage }))
);
const InitiativesManagement = React.lazy(() =>
  import('./admin/pages/InitiativesManagement').then((m) => ({ default: m.InitiativesManagement }))
);
const InitiativeEditPage = React.lazy(() =>
  import('./admin/pages/InitiativeEditPage').then((m) => ({ default: m.InitiativeEditPage }))
);
const FooterLinksManagement = React.lazy(() =>
  import('./admin/pages/FooterLinksManagement').then((m) => ({ default: m.FooterLinksManagement }))
);
const FooterLinkEditPage = React.lazy(() =>
  import('./admin/pages/FooterLinkEditPage').then((m) => ({ default: m.FooterLinkEditPage }))
);
const BookingsManagement = React.lazy(() =>
  import('./admin/pages/BookingsManagement').then((m) => ({ default: m.BookingsManagement }))
);
const Settings = React.lazy(() =>
  import('./admin/pages/Settings').then((m) => ({ default: m.Settings }))
);

// Scroll to top on navigation — mirrors the public App behavior.
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AdminRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="products/new" element={<ProductEditPage />} />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="courses/new" element={<CourseEditPage />} />
            <Route path="courses/:id/edit" element={<CourseEditPage />} />
            <Route path="trips" element={<TripsManagement />} />
            <Route path="trips/new" element={<TripEditPage />} />
            <Route path="trips/:id/edit" element={<TripEditPage />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/new" element={<BlogEditPage />} />
            <Route path="blog/:id/edit" element={<BlogEditPage />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="events/new" element={<EventEditPage />} />
            <Route path="events/:id/edit" element={<EventEditPage />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="team/new" element={<TeamMemberEditPage />} />
            <Route path="team/:id/edit" element={<TeamMemberEditPage />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="banners/new" element={<BannerEditPage />} />
            <Route path="banners/:id/edit" element={<BannerEditPage />} />
            <Route path="initiatives" element={<InitiativesManagement />} />
            <Route path="initiatives/new" element={<InitiativeEditPage />} />
            <Route path="initiatives/:id/edit" element={<InitiativeEditPage />} />
            <Route path="footer-links" element={<FooterLinksManagement />} />
            <Route path="footer-links/new" element={<FooterLinkEditPage />} />
            <Route path="footer-links/:id/edit" element={<FooterLinkEditPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

const AdminApp: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <AdminRoutes />
    </Router>
  );
};

export default AdminApp;
