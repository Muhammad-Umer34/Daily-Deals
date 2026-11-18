import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { authActions } from "../../../features/auth/authSlices";
import { cartActions } from "../../../features/customer/cartSlice";
import { getCardItems } from "../../../features/customer/customerApi";
import HeaderDropdown from "./headerDropdown";
import ChatbotModal from "../../../pages/customers/chatbot";

// One entry per department, with the subcategories the catalogue actually carries.
const NAV = [
  { label: "Women", to: "/home/women", items: ["Dresses", "Tops", "Kurta", "Trousers", "Knitwear", "Blazer", "Outerwear"] },
  { label: "Men", to: "/home/men", items: ["Shirts", "T-Shirt", "Kurta", "Knitwear", "Jacket", "Trousers", "Shoes"] },
  { label: "Kids", to: "/home/kids", items: ["Boys Clothing", "Girls Clothing"] },
  { label: "Accessories", to: "/home/accessories", items: ["Bags", "Scarves", "Eyewear"] },
];

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const cartUnits = useSelector((state) => state.cart.units);
  const cartLoaded = useSelector((state) => state.cart.loaded);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync bag count on load and whenever pathname changes
  useEffect(() => {
    if (!user?.id || !accessToken) return;
    getCardItems(user.id, accessToken)
      .then((items) => dispatch(cartActions.setItems((items || []).map((i) => ({ ...i, id: i._id })))))
      .catch(() => {
        /* a missing count is not worth an error on every page */
      });
  }, [user?.id, accessToken, pathname, dispatch]);

  // Close the panels whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (to) => pathname.startsWith(to);

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(`/home/all?q=${encodeURIComponent(q)}`);
  };

  const logout = () => {
    dispatch(authActions.logout());
    setMenuOpen(false);
    navigate("/login");
  };

  const accountLink = user?.userType === "storeOwner" ? "/store/dashboard" : "/home/profile";
  const bagLabel = `Bag (${cartUnits > 99 ? "99+" : cartUnits || 0})`;

  const searchForm = (id, autoFocus) => (
    <form onSubmit={onSearch} role="search" className="flex items-center gap-3 bg-parchment px-4">
      <label htmlFor={id} className="sr-only">Search the collection</label>
      <input
        id={id}
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dresses, shirts, linen, bags…"
        autoFocus={autoFocus}
        className="flex-1 bg-transparent py-3.5 text-base text-ink placeholder:text-bark focus:outline-none"
      />
      <button type="submit" className="text-[0.9375rem] font-semibold text-ink cursor-pointer">Search</button>
    </form>
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white">
        <div className="h-16 px-4 md:px-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <nav className="hidden lg:flex items-center gap-7 text-[0.9375rem] font-medium" aria-label="Main">
            {NAV.map((link) => (
              <div key={link.label} className="relative group">
                <NavLink
                  to={link.to}
                  className={`py-5 transition-colors ${isActive(link.to) ? "text-ink underline underline-offset-8 decoration-[1.5px]" : "text-ink hover:text-bark"}`}
                >
                  {link.label}
                </NavLink>
                <HeaderDropdown items={link.items} base={link.to} />
              </div>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden justify-self-start text-[0.9375rem] font-medium text-ink py-3 cursor-pointer"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <Link to="/home" aria-label="MonoFit home" className="font-bold text-[1.25rem] md:text-2xl tracking-[0.34em] pl-[0.34em] text-ink">
            MONOFIT
          </Link>

          <div className="flex items-center justify-end gap-5 md:gap-7 text-[0.9375rem] font-medium">
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-expanded={searchOpen}
              className="hidden md:block text-ink hover:text-bark transition-colors cursor-pointer"
            >
              {searchOpen ? "Close" : "Search"}
            </button>
            <Link
              to="/assistant"
              className={`hidden md:block transition-colors ${isActive("/assistant") ? "underline underline-offset-8 decoration-[1.5px]" : "hover:text-bark"}`}
            >
              Ask AI
            </Link>
            {user ? (
              <Link to={accountLink} className="hidden md:block text-ink hover:text-bark transition-colors">Account</Link>
            ) : (
              <Link to="/login" className="hidden md:block text-ink hover:text-bark transition-colors">Log in</Link>
            )}
            <Link
              to="/customer/cart"
              aria-label={cartUnits ? `Bag, ${cartUnits} item${cartUnits === 1 ? "" : "s"}` : "Bag, empty"}
              className="text-ink hover:text-bark transition-colors py-3"
            >
              {bagLabel}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="hidden md:block px-10 pb-6 pt-2">
            <div className="max-w-2xl mx-auto">{searchForm("site-search", true)}</div>
          </div>
        )}

        {menuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-8 space-y-6 bg-white max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
            {searchForm("site-search-mobile", false)}
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`py-3 text-3xl font-semibold tracking-[-0.03em] ${isActive(link.to) ? "underline underline-offset-8" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/assistant" className="py-3 text-3xl font-semibold tracking-[-0.03em]">Ask AI</Link>
            </nav>
            <div className="flex gap-6 text-base font-medium">
              {user ? (
                <>
                  <Link to={accountLink} className="py-2">Account</Link>
                  <button onClick={logout} className="py-2 text-bark cursor-pointer">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2">Log in</Link>
                  <Link to="/signup" className="py-2 text-bark">Create account</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Outside the header so a fixed child isn't trapped inside the header box. */}
      <ChatbotModal />
    </>
  );
}
