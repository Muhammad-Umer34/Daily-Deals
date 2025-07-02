import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import appStore from "../store";
import "./index.css";

// Components
import App from "./App.jsx";
import SigninCard from "./features/auth/loginForm.jsx";
import UserSignupCard from "./features/auth/userSignupForm.jsx";
import StoreSignupCard from "./features/auth/store.jsx";
import {StoreHome} from "./pages/storeOwner/home.jsx";
import {CustomerHome}from "./pages/customers/home.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <SigninCard/> },
      { path: "signup", element: <UserSignupCard /> },
      {path: "brand-signup", element: <StoreSignupCard /> },
      {path: "store", element: <StoreHome/> },
      {path: "customer", element:<CustomerHome /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
