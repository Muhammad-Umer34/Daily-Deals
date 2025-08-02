import { useState, useEffect } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  removeFromWishList,
  addToWishList,
  checkWishList,
} from "../../features/customer/customerApi";
import { useSelector } from "react-redux";
import WishList from "./wishlist";

const ProductCard = ({ product }) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (product && user) {
      checkWishList(product._id, accessToken, user.id).then((response) => {
        setLiked(response.exists);
      });
    }
  }, [product, user, accessToken]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      removeFromWishList(product._id, accessToken, user.id);
    } else {
      setLiked(true);
      console.log("product is : ", product);
      console.log("user is : ", user);
      addToWishList(product._id, accessToken, user.id);
    }
  };

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/images/placeholder.png";

  const handleOnClick = () => {
    navigate(`/home/${product.category}/${product.subcategory}/${product._id}`);
  };

return (
  <div
    onClick={handleOnClick}
    className="group relative w-full max-w-[260px] rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
  >
    {/* Product Image */}
    <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
      <img
        src={imageUrl}
        alt={product.name}
        className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {/* Like Button */}
      <button
        onClick={handleLike}
        className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
      >
        <FaHeart
          className={`text-xl ${
            liked ? "text-red-500" : "text-gray-300 group-hover:text-red-400"
          }`}
        />
      </button>

      {/* Price Tag */}
      <span className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
        Rs {product.price.toLocaleString("en-PK")}
      </span>
    </div>

    {/* Product Info */}
    <div className="px-4 py-4 text-center">
      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex justify-center items-center gap-1 mb-2">
        <FaStar className="text-yellow-400 text-sm" />
        <span className="text-sm text-gray-700 font-medium">
          {product.averageRating}
        </span>
      </div>

      {/* Stock Badge */}
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${
          product.stock > 0
            ? "bg-green-100/70 text-green-700 border-green-200"
            : "bg-red-100/70 text-red-700 border-red-200"
        }`}
      >
        {product.stock > 0 ? "In Stock" : "Out of Stock"}
      </span>
    </div>
  </div>
);

};

export default ProductCard;
