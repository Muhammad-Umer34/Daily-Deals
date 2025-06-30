import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="dark bg-zinc-900 min-h-screen min-w-full flex items-center justify-center">
      <p className="text-white">I am the Home</p>
      <Outlet />
    </div>
  );
};

export default App;
