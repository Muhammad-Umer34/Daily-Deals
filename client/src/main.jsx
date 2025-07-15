import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import appStore from "./store.js";
import "./index.css";
import App from "./App.jsx";
import SigninCard from "./features/auth/loginForm.jsx";
import UserSignupCard from "./features/auth/userSignupForm.jsx";
import StoreSignupCard from "./features/auth/store.jsx";
import StoreHome from "./pages/storeOwner/dashboard.jsx";
import CustomerHome from "./pages/customers/home.jsx";
import ResponsiveDrawer from "./components/ui/admin/sidebar.jsx";
import AddProduct from "./pages/storeOwner/addProduct.jsx";
import ProductDetailPage from "./pages/customers/productDetailPage.jsx";
import CartPage from "./pages/customers/cart.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {path: "customer", element:<CustomerHome/> },
    ],
  },
  {
    path: "/login",
    element: <SigninCard />,
  },
      {path: "store", element: <ResponsiveDrawer />},
  {
    path: "/signup",
    element: <UserSignupCard />,
  },
  {
    path: "/brand-signup",
    element: <StoreSignupCard />,
  },
  {
    path:"/customer/:id",
    element : <ProductDetailPage />
  },
  {
    path :"/customer/cart",
    element : <CartPage/>
  }
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
