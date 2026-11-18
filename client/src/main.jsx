import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import axios from "axios";

import appStore from "./store.js";
import "./index.css";
import App from "./App.jsx";
import { ShopLayout, RequireAuth, NotFound, RouteError } from "./components/layout.jsx";
import { authActions, tokenExpired } from "./features/auth/authSlices";
import { refreshSession } from "./features/auth/session";
import SigninCard from "./features/auth/loginForm.jsx";
import UserSignupCard from "./features/auth/userSignupForm.jsx";
import ForgotPasswordForm from "./features/auth/forgotPasswordForm.jsx";
import StoreSignupCard from "./features/auth/store.jsx";
import CustomerHome from "./pages/customers/home.jsx";
import AssistantPage from "./pages/customers/assistant.jsx";
import ProductDetailPage from "./pages/customers/productDetailPage.jsx";
import CartPage from "./pages/customers/cart.jsx";
import CategoryProductPage from "./pages/customers/categoryProductsPage.jsx";
import ProfileForm from "./pages/customers/profileInfo.jsx";
import CheckOut from "./pages/customers/CheckOut.jsx";
import OrderConfirmation from "./pages/customers/order-confirmation.jsx";
import DashBoard from "./pages/storeOwner/newDashboard.jsx";
import Order from "./pages/storeOwner/Orders.jsx";
import Products from "./pages/storeOwner/Products.jsx";
import Profile from "./pages/storeOwner/Profile.jsx";
import NewAddProduct from "./pages/storeOwner/newAddProduct.jsx";
import OrderDetails from "./pages/storeOwner/orderDetails.jsx";

// An expired access token is renewed from the refresh cookie and the request retried once.
// Only when renewal fails is the user logged out and sent to log in (and back here after).
axios.interceptors.response.use(undefined, async (error) => {
  const { status, data } = error.response || {};
  const msg = data?.message || "";
  const config = error.config || {};
  const tokenRejected = (status === 403 && /token/i.test(msg)) || (status === 401 && /no access token/i.test(msg));
  if (!tokenRejected || config._noRefresh) return Promise.reject(error);

  if (!config._retried && appStore.getState().auth.user) {
    const token = await refreshSession();
    if (token) {
      config._retried = true;
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      return axios(config);
    }
  }
  appStore.dispatch(authActions.logout());
  const here = window.location.pathname + window.location.search;
  window.location.assign(`/login?next=${encodeURIComponent(here)}`);
  return Promise.reject(error);
});

// Coming back after the 30-minute token ran out: renew it before anything asks.
if (appStore.getState().auth.user && tokenExpired(appStore.getState().auth.accessToken || "")) refreshSession();

const store = (page) => <RequireAuth role="storeOwner">{page}</RequireAuth>;
const shop = (page, needsLogin) => (
  <ShopLayout>{needsLogin ? <RequireAuth>{page}</RequireAuth> : page}</ShopLayout>
);

const routes = [
  {
    path: "/",
    element: <App />,
    children: [{ path: "home", element: <CustomerHome /> }],
  },
  // Chat-led shopping. Open to guests: searching needs no account.
  { path: "/assistant", element: <AssistantPage /> },
  { path: "/login", element: <SigninCard /> },
  { path: "/signup", element: <UserSignupCard /> },
  { path: "/brand-signup", element: <StoreSignupCard /> },
  { path: "/forgot-password", element: <ForgotPasswordForm /> },

  { path: "/store/dashboard", element: store(<DashBoard />) },
  { path: "/store/order", element: store(<Order />) },
  { path: "/store/order/:id", element: store(<OrderDetails />) },
  { path: "/store/products", element: store(<Products />) },
  { path: "/store/profile", element: store(<Profile />) },
  { path: "/store/add-product", element: store(<NewAddProduct />) },
  { path: "/store/new-add-product", element: store(<NewAddProduct />) },

  { path: "/home/profile", element: <RequireAuth><ProfileForm /></RequireAuth> },
  { path: "/home/:category", element: <CategoryProductPage /> },
  { path: "/home/:category/:subcategory", element: <CategoryProductPage /> },
  { path: "/home/:category/:subcategory/:id", element: <ProductDetailPage /> },
  { path: "/customer/cart", element: shop(<CartPage />, true) },
  { path: "/home/cart/checkout", element: shop(<CheckOut />, true) },
  { path: "/home/order-confirmation", element: shop(<OrderConfirmation />, true) },
  { path: "*", element: <NotFound /> },
];
// Every page gets a friendly error screen instead of React Router's developer one.
const router = createBrowserRouter(routes.map((r) => ({ errorElement: <RouteError />, ...r })));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
