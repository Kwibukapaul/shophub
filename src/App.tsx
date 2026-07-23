import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./context/useAuth";
import { getDashboardForRole } from "./lib/roles";
import { useIdleLogout } from "./hooks/useIdleLogout";
import { useTheme } from "./context/ThemeContext";

import Navigation from "./components/Navigation";
import Toasts from "./components/Toasts";
import WhatsAppChat from "./components/WhatsAppChat";
import AdminLayout from "./pages/admin/AdminLayout";
import StoreManagerLayout from "./pages/store-manager/StoreManagerLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthGate from "./components/AuthGate";
import ThemeProvider from "./components/ThemeProvider";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";

import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import ProfilePage from "./pages/ProfilePage";
import UserDashboard from "./pages/UserDashboard";
import PlatformReviews from "./pages/PlatformReviews";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Footer from "./components/Footer";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

function App() {
  const { session, role, storeId, logout, signOut, userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useIdleLogout(!!session, IDLE_TIMEOUT_MS, () => {
    (logout || signOut)().finally(() => navigate("/", { replace: true }));
  });

  const renderWithBoundary = (resetKey: string, element: ReactNode) => (
    <ErrorBoundary resetKey={resetKey}>{element}</ErrorBoundary>
  );

  const handleNavigate = (path: string) => {
    if (path === "home") navigate("/");
    else if (path === "login") navigate("/login");
    else if (path === "cart") navigate("/cart");
    else if (path === "orders") navigate("/orders");
    else if (path === "reviews") navigate("/reviews");
    else navigate(`/${path}`);
  };

  useEffect(() => {
    const onUnhandled = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
    };
    const onError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error || event.message);
    };

    window.addEventListener("unhandledrejection", onUnhandled as EventListener);
    window.addEventListener("error", onError as EventListener);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        onUnhandled as EventListener,
      );
      window.removeEventListener("error", onError as EventListener);
    };
  }, []);

  if (session && role === "admin") {
    return (
      <ThemeProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={renderWithBoundary(
              "admin-layout",
              <AdminLayout
                onLogout={async () => {
                  await (logout || signOut)();
                  navigate("/");
                }}
                userProfile={userProfile}
              />,
            )}
          />
          <Route
            path="*"
            element={<Navigate to={getDashboardForRole(role)} replace />}
          />
        </Routes>
      </ThemeProvider>
    );
  }

  if (session && role === "store_manager") {
    return (
      <ThemeProvider>
        <Routes>
          <Route
            path="/store-manager/*"
            element={renderWithBoundary(
              "store-manager-layout",
              <StoreManagerLayout
                onLogout={async () => {
                  await (logout || signOut)();
                  navigate("/");
                }}
                userProfile={userProfile}
                storeId={storeId}
              />,
            )}
          />
          <Route
            path="*"
            element={<Navigate to={getDashboardForRole(role)} replace />}
          />
        </Routes>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <AuthGate>
        <Routes>
          <Route
            path="/"
            element={renderWithBoundary(
              "public-home",
              <LandingPage
                onNavigate={handleNavigate}
                setCategorySlug={(slug) => navigate(`/category/${slug}`)}
              />,
            )}
          />
          <Route
            path="/login"
            element={renderWithBoundary("login", <Login />)}
          />
          <Route
            path="/signup"
            element={renderWithBoundary(
              "signup",
              <Signup onNavigate={handleNavigate} />,
            )}
          />
          <Route
            path="/reset-password"
            element={renderWithBoundary(
              "reset-password",
              <ResetPassword onNavigate={handleNavigate} />,
            )}
          />
          <Route
            path="/contact"
            element={renderWithBoundary("contact-public", <Contact />)}
          />
          <Route
            path="/about"
            element={renderWithBoundary("about-public", <About />)}
          />
          <Route
            path="/category/:slug"
            element={renderWithBoundary("category-public", <CategoryPage />)}
          />
          <Route
            path="/product/:id"
            element={renderWithBoundary("product-public", <ProductDetail />)}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthGate>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary
        resetKey="app-shell"
        title="The app shell hit a problem."
        description="Route-level crashes are isolated, but this catches layout-level issues."
      >
        <AuthGate>
          <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
            <Navigation userProfile={userProfile} />
            <Toasts />

            <Routes>
              <Route
                path="/"
                element={renderWithBoundary(
                  "home",
                  <HomePage
                    setCategorySlug={(slug) => navigate(`/category/${slug}`)}
                  />,
                )}
              />
              <Route
                path="/dashboard"
                element={renderWithBoundary("dashboard", <UserDashboard />)}
              />
              <Route
                path="/category/:slug"
                element={renderWithBoundary("category", <CategoryPage />)}
              />
              <Route
                path="/product/:id"
                element={renderWithBoundary("product", <ProductDetail />)}
              />
              <Route
                path="/cart"
                element={renderWithBoundary(
                  "cart",
                  <CartPage onNavigate={handleNavigate} />,
                )}
              />
              <Route
                path="/checkout"
                element={renderWithBoundary(
                  "checkout",
                  <CheckoutPage
                    onNavigate={handleNavigate}
                    setOrderId={(id) => navigate(`/order-confirmation/${id}`)}
                  />,
                )}
              />
              <Route
                path="/order-confirmation/:id"
                element={renderWithBoundary(
                  "order-confirmation",
                  <OrderConfirmation />,
                )}
              />
              <Route
                path="/orders"
                element={renderWithBoundary("orders", <OrderHistory />)}
              />
              <Route
                path="/orders/:id"
                element={renderWithBoundary(
                  "order-tracking",
                  <OrderTracking />,
                )}
              />
              <Route
                path="/order-tracking"
                element={<Navigate to="/orders" replace />}
              />
              <Route
                path="/profile"
                element={renderWithBoundary(
                  "profile",
                  <ProfilePage onNavigate={handleNavigate} />,
                )}
              />
              <Route
                path="/contact"
                element={renderWithBoundary("contact", <Contact />)}
              />
              <Route
                path="/about"
                element={renderWithBoundary("about", <About />)}
              />
              <Route
                path="/reviews"
                element={renderWithBoundary(
                  "reviews",
                  <PlatformReviews onNavigate={handleNavigate} />,
                )}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <WhatsAppChat />
          </div>
        </AuthGate>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
