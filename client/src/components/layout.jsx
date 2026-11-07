import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./ui/customer/header";
import Footer from "../pages/customers/footer";

// Header + page + footer for shop pages that don't render their own.
export function ShopLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

// Sends visitors without the right session to the login page.
export function RequireAuth({ role, children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.userType !== role) {
    return <Navigate to={user.userType === "storeOwner" ? "/store/dashboard" : "/home"} replace />;
  }
  return children;
}

// Shown instead of React Router's developer error screen when a page crashes.
export function RouteError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-500">Please refresh the page or go back to the shop.</p>
      <a href="/home" className="mt-8 px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800">
        Back to shop
      </a>
    </div>
  );
}

export function NotFound() {
  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center text-center py-32 px-4">
        <p className="text-6xl font-extrabold text-gray-900">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/home" className="mt-8 px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800">
          Back to shop
        </Link>
      </div>
    </ShopLayout>
  );
}
