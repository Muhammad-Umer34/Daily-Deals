import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const App = () => {
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);

  if (pathname === "/") {
    return <Navigate to={user?.userType === "storeOwner" ? "/store/dashboard" : "/home"} replace />;
  }
  return <Outlet />;
};
export default App;
