import { useNavigate } from "react-router-dom";

export default function HeaderDropdown({ items = [],Category }) {
  const navigate = useNavigate();
  return (
    <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]"
    
    >
      {items.map((item) => (
        <a
          key={item}
          href={`/home/${Category.toLowerCase()}/${item.toLowerCase()}`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {item}
        </a>
      ))}
    </div>
  );
}
