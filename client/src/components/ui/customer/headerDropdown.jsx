import { Link } from "react-router-dom";

// Subcategories under a department link: a small white menu that floats on hover or focus.
export default function HeaderDropdown({ items = [], base }) {
  if (!items.length) return null;
  return (
    <div className="absolute top-full -left-5 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-200 z-50">
      <ul className="bg-white shadow-[0_16px_40px_rgba(0,0,0,0.10)] px-5 py-4 min-w-[200px]">
        <li>
          <Link to={base} className="block py-1.5 text-[0.9375rem] font-semibold text-ink hover:text-bark">View all</Link>
        </li>
        {items.map((item) => (
          <li key={item}>
            <Link
              to={`${base}/${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="block py-1.5 text-[0.9375rem] text-ink hover:text-bark transition-colors"
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
