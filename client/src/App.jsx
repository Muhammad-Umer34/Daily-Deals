import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import  AppSidebar  from "./components/ui/admin/sidebar";

const App = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (window.location.pathname === "/") {
      if (isAuthenticated && user) {
        if (user.userType === "storeOwner") {
          navigate("/store/dashboard");
        } else if (user.userType === "customer") {
          navigate("/home");
        } else {
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="light bg-zinc-900 min-h-screen min-w-full flex items-center justify-center">
      <Outlet />
    </div>
  );
};
export default App;
