import { useState } from "react";
import { FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { authActions } from "../../../features/auth/authSlices";

const LINKS = [
  ["Dashboard", "/store/dashboard"],
  ["Products", "/store/products"],
  ["Orders", "/store/order"],
  ["Profile", "/store/profile"],
];

const NewHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate("/login");
  };

  // Active tab comes from the URL, so deep links and refreshes highlight correctly.
  const linkClass = ({ isActive }) =>
    `font-medium transition-colors ${isActive ? "text-black" : "text-gray-500 hover:text-black"}`;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-4">
        <Link to="/store/dashboard" className="text-xl sm:text-2xl font-bold text-black whitespace-nowrap">
          Daily <span className="text-blue-600">Deals</span>
          <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Seller</span>
        </Link>

        <nav className="hidden md:flex gap-6" aria-label="Store">
          {LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === "/store/order"} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden lg:flex items-center gap-2 text-gray-700 font-medium">
            <FiUser aria-hidden="true" /> {user?.brand_name || user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 cursor-pointer"
          >
            <FiLogOut aria-hidden="true" /> Logout
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden p-1 text-gray-800 cursor-pointer"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col">
          {LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === "/store/order"} onClick={() => setOpen(false)} className={({ isActive }) => `py-2.5 ${linkClass({ isActive })}`}>
              {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="mt-2 py-2.5 rounded-lg border border-gray-300 font-semibold text-red-600 cursor-pointer">
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

export default NewHeader;
