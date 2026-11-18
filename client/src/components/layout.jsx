import { Link, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./ui/customer/header";
import Footer from "../pages/customers/footer";

// Header + page + footer for shop pages that don't render their own.
export function ShopLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-paper">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

// Sends visitors without the right session to the login page.
export function RequireAuth({ role, children }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  // Hand the page they wanted to the login screen so it can send them back after they log in.
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role && user.userType !== role) {
    return <Navigate to={user.userType === "storeOwner" ? "/store/dashboard" : "/home"} replace />;
  }
  return children;
}

// Shown instead of React Router's developer error screen when a page crashes.
export function RouteError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 text-bark">Please refresh the page or go back to the shop.</p>
      <a href="/home" className="mt-8 px-6 py-3 bg-ink text-paper rounded-full font-semibold hover:opacity-80">
        Back to shop
      </a>
    </div>
  );
}

export function NotFound() {
  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center text-center py-32 px-4">
        <p className="text-6xl font-extrabold text-ink">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-bark">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/home" className="mt-8 px-6 py-3 bg-ink text-paper rounded-full font-semibold hover:opacity-80">
          Back to shop
        </Link>
      </div>
    </ShopLayout>
  );
}
