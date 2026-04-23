import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/features/WhatsAppButton';
import { PageLoader } from './components/ui/PageLoader';

// Public pages — lazy-loaded for route-level code splitting.
// Each page ships as its own chunk and is only fetched when the user
// navigates to it. Pages use named exports, so we map them to `default`
// for React.lazy.
const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const CoursesPage = React.lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage }))
);
const CourseDetailPage = React.lazy(() =>
  import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage }))
);
const TripsPage = React.lazy(() =>
  import('./pages/TripsPage').then((m) => ({ default: m.TripsPage }))
);
const TripDetailPage = React.lazy(() =>
  import('./pages/TripDetailPage').then((m) => ({ default: m.TripDetailPage }))
);
const BlogPage = React.lazy(() =>
  import('./pages/BlogPage').then((m) => ({ default: m.BlogPage }))
);
const BlogDetailPage = React.lazy(() =>
  import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage }))
);
const ContactPage = React.lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const EventsPage = React.lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = React.lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const InitiativesPage = React.lazy(() =>
  import('./pages/InitiativesPage').then((m) => ({ default: m.InitiativesPage }))
);
const InitiativeDetailPage = React.lazy(() =>
  import('./pages/InitiativeDetailPage').then((m) => ({ default: m.InitiativeDetailPage }))
);
const FooterLinkPage = React.lazy(() =>
  import('./pages/FooterLinkPage').then((m) => ({ default: m.FooterLinkPage }))
);
const FAQPage = React.lazy(() =>
  import('./pages/FAQPage').then((m) => ({ default: m.FAQPage }))
);

// Simple scroll to top on navigation (except back/forward)
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Enable browser's native scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

  useEffect(() => {
    // Scroll to top on new page navigation
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/shop/courses" element={<CoursesPage />} />
              <Route path="/shop/courses/:id" element={<CourseDetailPage />} />
              <Route path="/shop/trips" element={<TripsPage />} />
              <Route path="/shop/trips/:id" element={<TripDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/initiatives" element={<InitiativesPage />} />
              <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/pages/:slug" element={<FooterLinkPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <WhatsAppButton />
      <AppRoutes />
    </Router>
  );
};

export default App;
