import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetails from './pages/ProductDetails';
import CategoryProducts from './pages/CategoryProducts';
import Checkout from './pages/Checkout';
import ContactUs from './pages/ContactUs';
import UserAccount from './pages/UserAccount';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import SalesReport from './pages/admin/SalesReport';
import Products from './pages/admin/Products';
import CouponVoucher from './pages/admin/CouponVoucher';
import Orders from './pages/admin/Orders';
import OrderDetails from './pages/admin/OrderDetails';
import AbandonedCarts from './pages/admin/AbandonedCarts';
import AbandonedCartDetails from './pages/admin/AbandonedCartDetails';
import ShippingDelays from './pages/admin/ShippingDelays';
import PaymentFailures from './pages/admin/PaymentFailures';
import RefundRequests from './pages/admin/RefundRequests';
import Reviews from './pages/admin/Reviews';
import ReviewDetails from './pages/admin/ReviewDetails';
import Users from './pages/admin/Users';
import CategoryManager from './pages/admin/CategoryManager';
import Settings from './pages/admin/Settings';
import Campaigns from './pages/admin/Campaigns';
import Payments from './pages/admin/Payments';
import Expenses from './pages/admin/Expenses';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatButton from './components/FloatingChatButton';
import ScrollToTop from './components/ScrollToTop';
import API from './api/axios';

const UserLayout = ({ children }) => (
  <div className="flex flex-col gap-0 pt-32 sm:pt-40">
    <Navbar />
    {children}
    <Footer />
    <FloatingChatButton />
  </div>
);

function App() {
  useEffect(() => {
    const initializeFacebookPixel = (pixelId) => {
      const id = String(pixelId || '').trim();
      if (!id || typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      if (window.fbq) {
        window.fbq('init', id);
        window.fbq('track', 'PageView');
        return;
      }

      ((f, b, e, v, n, t, s) => {
        if (f.fbq) return;
        n = f.fbq = function () {
          // eslint-disable-next-line prefer-rest-params
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', id);
      window.fbq('track', 'PageView');
    };

    const applySiteBranding = async () => {
      try {
        const { data } = await API.get('/settings');

        if (data?.siteTitle) {
          document.title = data.siteTitle;
        }

        if (data?.faviconUrl) {
          let favicon = document.querySelector("link[rel='icon']");
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.setAttribute('rel', 'icon');
            document.head.appendChild(favicon);
          }
          favicon.setAttribute('href', data.faviconUrl);
        }

        if (data?.facebookPixelEnabled && data?.facebookPixelId) {
          initializeFacebookPixel(data.facebookPixelId);
        }
      } catch (error) {
        console.error('Failed to apply site branding:', error);
      }
    };

    applySiteBranding();

    // Intersection Observer for Reveal Animations
    const revealCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    const observerTimer = setInterval(() => {
      const elements = document.querySelectorAll('.reveal:not(.reveal-visible)');
      elements.forEach((el) => revealObserver.observe(el));
    }, 1000);

    return () => {
      clearInterval(observerTimer);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <ScrollToTop />
      <Routes>
        {/* Public / User Routes */}
        <Route path="/" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/products" element={<UserLayout><CategoryProducts /></UserLayout>} />
        <Route path="/products/:categorySlug" element={<UserLayout><CategoryProducts /></UserLayout>} />
        <Route path="/category/:categoryName" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/contact-us" element={<UserLayout><ContactUs /></UserLayout>} />
        <Route path="/terms-and-conditions" element={<UserLayout><TermsAndConditions /></UserLayout>} />
        <Route path="/privacy-policy" element={<UserLayout><PrivacyPolicy /></UserLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/wishlist" element={<Navigate to="/account/wishlist" replace />} />
        <Route path="/product/:id" element={<UserLayout><ProductDetails /></UserLayout>} />
        <Route
          path="/account/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/account/profile" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/profile"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/orders"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/payments"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/wishlist"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/reviews"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <ProtectedRoute>
              <UserLayout><UserAccount /></UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={<UserLayout><Checkout /></UserLayout>}
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <Navigate to="/account/orders" replace />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes — nested under AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="products" element={<Products />} />
          <Route path="coupons" element={<CouponVoucher />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="settings" element={<Settings />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="payments" element={<Payments />} />
          <Route path="shipping-delays" element={<ShippingDelays />} />
          <Route path="payment-failures" element={<PaymentFailures />} />
          <Route path="refund-requests" element={<RefundRequests />} />
          <Route path="abandoned-carts" element={<AbandonedCarts />} />
          <Route path="abandoned-carts/:userId" element={<AbandonedCartDetails />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reviews/:id" element={<ReviewDetails />} />
          <Route path="customers" element={<Users />} />
          <Route path="users" element={<Navigate to="/admin/settings?tab=users" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
