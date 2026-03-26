import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; // 👈 Added useNavigate
import { useEffect } from "react";
import { useAuth } from "./context/useAuth";
import { useTheme } from "./context/ThemeContext";

import Navigation from "./components/Navigation";
import AdminLayout from "./pages/admin/AdminLayout";
import StoreManagerLayout from "./pages/store-manager/StoreManagerLayout";
import ErrorBoundary from "./components/ErrorBoundary";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";

import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import ProfilePage from "./pages/ProfilePage";
import PlatformReviews from "./pages/PlatformReviews";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Footer from "./components/Footer";

function App() {
  // 👇 Extract userProfile for AdminLayout & StoreManagerLayout
  const {
    session,
    loading,
    isAdmin,
    isStoreManager,
    storeId,
    signOut,
    userProfile,
  } = useAuth();
  const { isDark } = useTheme();

  // 👇 Initialize the router hook
  const navigate = useNavigate();

  // 👇 BRIDGE FUNCTION: Converts old 'onNavigate' strings to real routes
  const handleNavigate = (path: string) => {
    if (path === "home") navigate("/");
    else if (path === "login") navigate("/login");
    else if (path === "cart") navigate("/cart");
    else if (path === "orders") navigate("/orders");
    else if (path === "reviews") navigate("/reviews");
    // Add other generic paths as needed, or default to:
    else navigate(`/${path}`);
  };

  // attach global error handlers so unhandled promises don't leave app frozen
  useEffect(() => {
    const onUnhandled = (e: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", e.reason);
    };
    const onError = (e: ErrorEvent) => {
      console.error("Uncaught error:", e.error || e.message);
    };

    window.addEventListener("unhandledrejection", onUnhandled as any);
    window.addEventListener("error", onError as any);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandled as any);
      window.removeEventListener("error", onError as any);
    };
  }, []);

  // ⏳ WAIT FOR AUTH + ADMIN CHECK
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 ADMIN ROUTES ONLY
  if (session && isAdmin) {
    return (
      <Routes>
        <Route
          path="/admin/*"
          // 👇 Passed userProfile to satisfy the interface
          element={
            <AdminLayout
              onLogout={async () => {
                await signOut();
                navigate("/");
              }}
              userProfile={userProfile}
            />
          }
        />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    );
  }

  // 🏪 STORE MANAGER ROUTES ONLY
  if (session && isStoreManager) {
    return (
      <Routes>
        <Route
          path="/store-manager/*"
          element={
            <StoreManagerLayout
              onLogout={async () => {
                await signOut();
                navigate("/");
              }}
              userProfile={userProfile}
              storeId={storeId}
            />
          }
        />
        <Route path="*" element={<Navigate to="/store-manager" />} />
      </Routes>
    );
  }

  // 🔓 NOT LOGGED IN (Public Routes)
  if (!session) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onNavigate={handleNavigate}
              // 👇 Intercept setters to route directly to the dynamic page
              setCategorySlug={(slug) => navigate(`/category/${slug}`)}
              setProductId={(id) => navigate(`/product/${id}`)}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/signup"
          element={<Signup onNavigate={handleNavigate} />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword onNavigate={handleNavigate} />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        {/* Redirect generic category/product links back to home if not logged in, or handled above */}
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // 👤 NORMAL USER ROUTES
  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
        <Navigation />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onNavigate={handleNavigate}
                // 👇 Intercept setters to route directly
                setCategorySlug={(slug) => navigate(`/category/${slug}`)}
                setProductId={(id) => navigate(`/product/${id}`)}
              />
            }
          />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route
            path="/cart"
            element={<CartPage onNavigate={handleNavigate} />}
          />

          <Route
            path="/checkout"
            element={
              <CheckoutPage
                onNavigate={handleNavigate}
                // 👇 When checkout sets order ID, go to confirmation
                setOrderId={(id) => navigate(`/order-confirmation/${id}`)}
              />
            }
          />

          <Route
            path="/order-confirmation/:id"
            element={
              <OrderConfirmation
                onNavigate={handleNavigate}
                // We grab ID from URL params inside the component, but if it requires props:
                orderId={window.location.pathname.split("/").pop() || ""}
              />
            }
          />

          <Route
            path="/order-tracking"
            element={<OrderTracking onNavigate={handleNavigate} />}
          />

          <Route
            path="/orders"
            element={
              <OrderHistory
                onNavigate={handleNavigate}
                setOrderId={(id) => navigate(`/order-confirmation/${id}`)}
              />
            }
          />

          <Route
            path="/profile"
            element={<ProfilePage onNavigate={handleNavigate} />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/reviews"
            element={<PlatformReviews onNavigate={handleNavigate} />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
