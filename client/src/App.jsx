import { Outlet } from "react-router-dom";
import  AppSidebar  from "./components/ui/admin/sidebar";

const App = () => {
  return (
    <div className="dark bg-zinc-900 min-h-screen min-w-full flex items-center justify-center">
      <Outlet />
    </div>
  );
};
export default App;
