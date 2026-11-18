import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
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
    e.preventDefault();
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
    <article className="group relative w-full min-w-0">
      <Link to={productUrl} className="block">
        <div className="relative w-full aspect-[3/4] bg-parchment overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            // A seller photo that no longer exists shows the plain frame, not a broken-image icon.
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
          {product.stock <= 0 ? (
            <span className="absolute left-3 bottom-3 bg-white px-2.5 py-1 text-[0.8125rem] font-semibold">Sold out</span>
          ) : (
            <span className="absolute left-3 right-3 bottom-3 bg-white py-3 text-center text-sm font-semibold opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
              View details
            </span>
          )}
        </div>
        <div className="pt-3.5">
          {product.brand && <p className="text-[0.8125rem] text-bark">{product.brand}</p>}
          <h3 className="text-[0.9375rem] font-medium text-ink leading-snug line-clamp-1 mt-0.5">{product.name}</h3>
          <p className="text-[0.9375rem] font-semibold text-ink tabular-nums mt-1">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <button
        onClick={handleLike}
        aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={liked}
        className="absolute top-2.5 right-2.5 w-9 h-9 grid place-items-center bg-white text-ink hover:bg-parchment transition-colors cursor-pointer"
      >
        {liked ? <FaHeart className="text-oxblood text-sm" /> : <FaRegHeart className="text-sm" />}
      </button>
    </article>
  );
};

export default ProductCard;
