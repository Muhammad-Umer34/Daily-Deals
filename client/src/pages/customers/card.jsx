import { useState, useEffect } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  removeFromWishList,
  addToWishList,
  checkWishList,
} from "../../features/customer/customerApi";
import { useSelector } from "react-redux";
import { formatPrice } from "@/lib/utils";

const ProductCard = ({ product }) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (product && user) {
      checkWishList(product._id, accessToken, user.id)
        .then((response) => setLiked(response.exists))
        .catch(() => {});
    }
  }, [product, user, accessToken]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    if (liked) {
      setLiked(false);
      removeFromWishList(product._id, accessToken, user.id);
    } else {
      setLiked(true);
      addToWishList(product, accessToken, user.id);
    }
  };

  const imageUrl = product.images?.[0] || "/images/daily_deals.png";
  const productUrl = `/home/${product.category}/${product.subcategory}/${product._id}`;

  return (
    <div
      onClick={() => navigate(productUrl)}
      className="group relative w-full rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <button
          onClick={handleLike}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition cursor-pointer"
        >
          <FaHeart className={`text-lg ${liked ? "text-red-500" : "text-gray-300 group-hover:text-red-400"}`} />
        </button>
        <span className="absolute bottom-2 left-2 bg-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold text-gray-800 shadow-sm">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4 text-center">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex justify-center items-center gap-1 mb-2 text-xs sm:text-sm text-gray-600">
          {product.reviewsCount > 0 ? (
            <>
              <FaStar className="text-yellow-400" aria-hidden="true" />
              <span className="font-medium">{Number(product.averageRating).toFixed(1)}</span>
              <span className="text-gray-400">({product.reviewsCount})</span>
            </>
          ) : (
            <span className="text-gray-400">No reviews yet</span>
          )}
        </div>
        {product.stock <= 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
