import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import appStore from "../store";
import "./index.css";

// Components
import App from "./App.jsx";
import SigninCard from "./features/auth/loginForm.jsx";
import SignupCard from "./features/auth/signupForm.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <SigninCard/> },
      { path: "signup", element: <SignupCard/> },
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
