import { Link } from "react-router-dom";

const CategoryCard = ({ category, productCount = 0 }) => {
  const defaultImage = "/default-category.jpg";
  const imageUrl = category.image || defaultImage;


  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 w-[300px] min-w-[240px] mx-auto">
      <div className="relative h-[180px] w-full">
        <img
          src={imageUrl}
          alt={category.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <h2 className="text-white text-xl font-bold text-center">
            {category.name}
          </h2>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-gray-500 text-sm">
          {productCount} {productCount === 1 ? "product" : "products"}
        </span>
        <Link
          to={`/home/${category.name.toLowerCase()}`}
          className="text-sm font-semibold text-black hover:underline flex items-center"
        >
          Shop Now
          <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;
