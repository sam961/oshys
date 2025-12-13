import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/features/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { CoursesPage } from './pages/CoursesPage';
import { TripsPage } from './pages/TripsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { InitiativesPage } from './pages/InitiativesPage';
import { InitiativeDetailPage } from './pages/InitiativeDetailPage';
import { FooterLinkPage } from './pages/FooterLinkPage';

// Admin imports
import { AdminLayout } from './admin/layouts/AdminLayout';
import { Dashboard } from './admin/pages/Dashboard';
import { ProductsManagement } from './admin/pages/ProductsManagement';
import { CoursesManagement } from './admin/pages/CoursesManagement';
import { TripsManagement } from './admin/pages/TripsManagement';
import { BlogManagement } from './admin/pages/BlogManagement';
import { EventsManagement } from './admin/pages/EventsManagement';
import { TeamManagement } from './admin/pages/TeamManagement';
import { BannerManagement } from './admin/pages/BannerManagement';
import { InitiativesManagement } from './admin/pages/InitiativesManagement';
import { FooterLinksManagement } from './admin/pages/FooterLinksManagement';
import { Settings } from './admin/pages/Settings';

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
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {isAdminRoute ? (
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="trips" element={<TripsManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="initiatives" element={<InitiativesManagement />} />
            <Route path="footer-links" element={<FooterLinksManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      ) : (
        <div className="flex flex-col min-h-screen bg-white">
          <Navbar />
          <main className="grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/shop/products" element={<ProductsPage />} />
              <Route path="/shop/courses" element={<CoursesPage />} />
              <Route path="/shop/trips" element={<TripsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/initiatives" element={<InitiativesPage />} />
              <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
              <Route path="/pages/:slug" element={<FooterLinkPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
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
