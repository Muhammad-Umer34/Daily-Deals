import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const defaultImage = "/default-category.jpg"; 
  const imageUrl = category.image || defaultImage;
  console.log("Category Image URL:", imageUrl);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 w-[300px] min-w-[240px] mx-auto">
      <div className="relative h-[180px] w-full">
        <img
          src={imageUrl}
          alt={category.name}
          className="h-full w-full object-cover"
        />
        
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-gray-500 text-sm">0 products</span>
        <Link
          to={`/category/${category._id}`}
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
