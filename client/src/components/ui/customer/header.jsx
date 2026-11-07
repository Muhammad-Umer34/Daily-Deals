import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { authActions } from "../../../features/auth/authSlices";
import HeaderDropdown from "./headerDropdown";
import ChatbotModal from "../../../pages/customers/chatbot";

// Each nav link maps to a /home/<segment> listing page; dropdown items are its subcategories.
const NAV = [
  { label: "Home", to: "/home", items: [] },
  { label: "Men", to: "/home/men", items: ["T-Shirt", "Shirts", "Jeans", "Jacket", "Shoes"] },
  { label: "Women", to: "/home/women", items: ["Dresses", "Tops", "Skirts", "Shoes", "Accessories"] },
  { label: "Kids", to: "/home/kids", items: ["Boys Clothing", "Girls Clothing", "Baby Wear"] },
  { label: "Shop All", to: "/home/all", items: [] },
];

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to) => (to === "/home" ? pathname === "/home" : pathname.startsWith(to));

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setMenuOpen(false);
    navigate(`/home/all?q=${encodeURIComponent(q)}`);
  };

  const logout = () => {
    dispatch(authActions.logout());
    setMenuOpen(false);
    navigate("/login");
  };

  const accountLink = user?.userType === "storeOwner" ? "/store/dashboard" : "/home/profile";

  const searchBox = (className) => (
    <form onSubmit={onSearch} role="search" className={`relative ${className}`}>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full border border-gray-300 rounded-full pl-4 pr-9 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-all"
      />
      <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
        <BiSearch />
      </button>
    </form>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        <Link to="/home" className="text-2xl font-extrabold tracking-tight text-slate-900 shrink-0">
          Daily <span className="text-blue-600">Deals</span>
        </Link>

        <nav className="hidden md:flex gap-6 font-medium text-sm" aria-label="Main">
          {NAV.map((link) => (
            <div key={link.label} className="relative group">
              <NavLink
                to={link.to}
                className={`${isActive(link.to) ? "text-black font-semibold" : "text-gray-500 hover:text-black"} transition-colors py-5`}
              >
                {link.label}
              </NavLink>
              {link.items.length > 0 && <HeaderDropdown items={link.items} base={link.to} />}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {searchBox("hidden md:block w-36 lg:w-56")}

          <Link to="/customer/cart" aria-label="Cart" className="text-gray-700 hover:text-blue-600 transition-colors">
            <FaShoppingCart size={20} />
          </Link>

          {user ? (
            <>
              <Link to={accountLink} aria-label="My account" className="text-gray-700 hover:text-blue-600 transition-colors">
                <FaUserCircle size={22} />
              </Link>
              <button onClick={logout} aria-label="Log out" title="Log out" className="hidden md:block text-gray-700 hover:text-red-600 transition-colors cursor-pointer">
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-4 py-1.5 text-sm font-semibold text-gray-900 rounded-full hover:bg-gray-100">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-1.5 text-sm font-semibold text-white bg-black rounded-full hover:bg-gray-800">
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden text-gray-800 p-1 cursor-pointer"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-4 bg-white">
          {searchBox("w-full")}
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`py-2.5 text-base ${isActive(link.to) ? "font-semibold text-black" : "text-gray-600"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <button onClick={logout} className="w-full py-2.5 rounded-full border border-gray-300 font-semibold text-red-600 cursor-pointer">
              Log out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2.5 text-center rounded-full border border-gray-300 font-semibold">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="py-2.5 text-center rounded-full bg-black text-white font-semibold">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}

      <ChatbotModal />
    </header>
  );
}
