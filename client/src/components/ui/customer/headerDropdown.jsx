import { Link } from "react-router-dom";

export default function HeaderDropdown({ items = [], base }) {
  return (
    <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50 min-w-[160px]">
      {items.map((item) => (
        <Link
          key={item}
          to={`${base}/${item.toLowerCase().replace(/\s+/g, "-")}`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
