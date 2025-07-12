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
    navigate(`/customer/${product._id}`);
  };

  return (
    <div
      onClick={handleOnClick}
      className="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.13)] transition-all duration-300 overflow-hidden w-[260px] border border-gray-100 flex flex-col cursor-pointer group"
    >
      {/* Image with Heart */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-[180px] object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike();
          }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow transition-colors border border-gray-200"
        >
          <FaHeart
            className={`text-xl transition-colors ${
              liked ? "text-red-500" : "text-gray-300 group-hover:text-red-400"
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-base font-semibold line-clamp-2 text-gray-900 min-h-[48px]">{name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-600 font-medium">
            <FaStar className="text-yellow-400" />
            {ratings}
          </span>
          <span className="text-xs text-gray-400">· {purchasedCount}+ Sold</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-xl font-bold text-blue-600 tracking-tight">
            Rs {price.toLocaleString("en-PK")}
          </p>
          {product.stock > 0 ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100/70 text-green-700 border border-green-200">
              In Stock
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100/70 text-red-700 border border-red-200">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
