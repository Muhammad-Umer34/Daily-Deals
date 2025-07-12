import { useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { name, price, purchasedCount, ratings, images } = product;
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const toggleLike = () => setLiked(!liked);

  const imageUrl = images && images.length > 0 ? images[0] : "/images/placeholder.png";

  const handleOnClick = () => {
    console.log("Product clicked:", product._id);
    navigate(`/customer/${product._id}`);
  };

  return (
    <div
      onClick={handleOnClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden w-[240px] border border-gray-100 flex flex-col cursor-pointer"
    >
      {/* Image with Heart */}
      <div className="relative group">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-[180px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            toggleLike();
          }}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
        >
          <FaHeart
            className={`text-xl transition-colors ${
              liked ? "text-red-500" : "text-gray-300 group-hover:text-red-400"
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold line-clamp-2 mb-1 text-gray-900">{name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FaStar className="text-yellow-400 mr-1 text-sm" />
          <span className="font-semibold">{ratings}</span>
          <span className="ml-2 text-xs text-gray-400">· {purchasedCount}+ Sold</span>
        </div>
        <div className="mt-auto">
          <p className="text-lg font-bold text-blue-600">Rs - {price.toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
