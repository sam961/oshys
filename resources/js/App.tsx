import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/features/WhatsAppButton';
import { PageTransition, ScrollToTop } from './components/animations';
import { useSmoothScroll } from './components/animations';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { CoursesPage } from './pages/CoursesPage';
import { TripsPage } from './pages/TripsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';

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
import { Settings } from './admin/pages/Settings';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  useSmoothScroll();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <HomePage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/about" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <AboutPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/shop/products" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <ProductsPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/shop/courses" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <CoursesPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/shop/trips" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <TripsPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/blog" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <BlogPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/blog/:id" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <BlogDetailPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />
        <Route path="/contact" element={
          <PageTransition>
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-grow">
                <ContactPage />
              </main>
              <Footer />
            </div>
          </PageTransition>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="courses" element={<CoursesManagement />} />
          <Route path="trips" element={<TripsManagement />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="events" element={<EventsManagement />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <WhatsAppButton />
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
