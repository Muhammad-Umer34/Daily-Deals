import { Link } from "react-router-dom";

const CategoryCard = ({ category, productCount = 0 }) => {
  return (
    <Link
      to={`/home/${category.name.toLowerCase()}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 w-full"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {category.image ? (
          <img
            src={category.image}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white text-lg sm:text-xl font-bold">{category.name}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 text-sm">
        <span className="text-gray-500">
          {productCount} {productCount === 1 ? "product" : "products"}
        </span>
        <span className="font-semibold text-black group-hover:underline">Shop →</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
