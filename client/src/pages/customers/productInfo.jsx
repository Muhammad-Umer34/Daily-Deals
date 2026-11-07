import { useEffect, useState } from "react";
import { FaStar, FaMinus, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ImageCarousel } from "./carouselComponent";
import ReviewBox from "./review";
import WishList from "./wishlist";
import { addToCart } from "../../features/customer/customerApi";
import { formatPrice } from "@/lib/utils";

const titleCase = (s) => (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const ProductInfo = ({ product }) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelectedColor(product.color?.[0] || "");
    setSelectedSize(product.size?.[0] || "");
  }, [product]);

  const inStock = product.stock > 0;
  const maxQty = Math.max(1, product.stock || 1);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setStatus(null);
    try {
      await addToCart(
        { productId: product._id, quantity, color: selectedColor, size: selectedSize },
        accessToken
      );
      setStatus({ type: "ok", text: "Added to cart" });
    } catch (error) {
      setStatus({ type: "error", text: error.response?.data?.message || "Couldn't add to cart. Please try again." });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          <ImageCarousel images={product.images} name={product.name} />
        </div>

        <div className="md:w-1/2 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.brand && <p className="text-sm uppercase tracking-wide text-gray-500">{product.brand}</p>}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            </div>
            {product.brand_logo && (
              <img src={product.brand_logo} alt={`${product.brand || "Brand"} logo`} className="h-12 w-auto object-contain" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            {product.reviewsCount > 0 ? (
              <>
                <FaStar className="text-yellow-400" aria-hidden="true" />
                <span className="font-medium">{Number(product.averageRating).toFixed(1)} / 5</span>
                <span className="text-gray-400">({product.reviewsCount} reviews)</span>
              </>
            ) : (
              <span className="text-gray-400">No reviews yet</span>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
          <p className="text-sm text-gray-500">
            Category: {titleCase(product.category)}
            {product.material && <> · Material: {product.material}</>}
          </p>

          <div>
            <p className="text-sm font-semibold mb-2">
              Size: <span className="font-normal text-gray-600">{selectedSize.toUpperCase()}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.size.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={selectedSize === s}
                  className={`min-w-11 px-3 py-2 rounded-md border text-sm font-medium uppercase transition-all cursor-pointer ${
                    selectedSize === s ? "bg-black text-white border-black" : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">
              Color: <span className="font-normal text-gray-600">{titleCase(selectedColor)}</span>
            </p>
            <div className="flex items-center gap-3">
              {product.color.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  aria-label={titleCase(c)}
                  aria-pressed={selectedColor === c}
                  title={titleCase(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor === c ? "ring-2 ring-offset-2 ring-black border-white" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Quantity</p>
            <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3 py-2.5 hover:bg-gray-100 cursor-pointer"
              >
                <FaMinus size={12} />
              </button>
              <span className="px-4 font-medium" aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                aria-label="Increase quantity"
                className="px-3 py-2.5 hover:bg-gray-100 cursor-pointer"
              >
                <FaPlus size={12} />
              </button>
            </div>
            {inStock && product.stock <= 5 && (
              <p className="text-sm text-amber-600 mt-2">Only {product.stock} left</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="bg-black text-white font-semibold px-6 py-3.5 w-full rounded-md hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {!inStock ? "Out of stock" : adding ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
            </button>
            <WishList product={product} />
          </div>

          {status && (
            <p role="status" className={`text-sm ${status.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {status.type === "ok" ? "✓ " : ""}
              {status.text}
              {status.type === "ok" && (
                <Link to="/customer/cart" className="ml-2 font-semibold underline">View cart</Link>
              )}
            </p>
          )}
        </div>
      </div>

      <ReviewBox product={product} />
    </div>
  );
};

export default ProductInfo;
