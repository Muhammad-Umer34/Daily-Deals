import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ImageCarousel } from "./carouselComponent";
import ReviewBox from "./review";
import WishList from "./wishlist";
import { addToCart } from "../../features/customer/customerApi";
import { formatPrice } from "@/lib/utils";

const FAMILY_HEX = { black: "#111111", white: "#f5f5f0", grey: "#9ca3af", blue: "#3b5b92", red: "#a3222b", pink: "#e8a5b5", green: "#5f7d4e", brown: "#8b5e3c", yellow: "#d9b23a", orange: "#d9772b", purple: "#6b4c8a" };

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

  // Stock lives on each size-and-colour variant.
  const variants = product.variants || [];
  const variantFor = (size, color) => variants.find((v) => v.size === size && v.color === color);
  const stockFor = (size, color) => (variants.length ? variantFor(size, color)?.stock ?? 0 : product.stock || 0);

  // Start on the first colour that has anything in stock, and its first size in stock.
  useEffect(() => {
    const firstColor = product.color?.find((c) => (product.size || []).some((s) => stockFor(s, c) > 0)) || product.color?.[0] || "";
    setSelectedColor(firstColor);
    setSelectedSize((product.size || []).find((s) => stockFor(s, firstColor) > 0) || product.size?.[0] || "");
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const selectedStock = stockFor(selectedSize, selectedColor);
  const inStock = selectedStock > 0;
  const maxQty = Math.max(1, selectedStock);
  const chooseColor = (c) => {
    setSelectedColor(c);
    // Keep the size if it exists in the new colour, otherwise move to one that does.
    if (stockFor(selectedSize, c) <= 0) setSelectedSize((product.size || []).find((sz) => stockFor(sz, c) > 0) || selectedSize);
    setQuantity(1);
  };
  const swatch = (c) => {
    const family = variants.find((v) => v.color === c)?.colorFamily;
    return typeof CSS !== "undefined" && CSS.supports("color", c) ? c : FAMILY_HEX[family] || "#d4d4d4";
  };

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

        <div className="md:w-[42%] md:max-w-md space-y-6 md:sticky md:top-24 md:self-start">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {product.brand && <p className="note text-bark mb-2">{product.brand}</p>}
              <h1 className="font-display font-semibold tracking-[-0.02em] text-3xl md:text-5xl leading-tight text-ink">{product.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 font-meta text-xs text-bark">
            {product.reviewsCount > 0 ? (
              <>
                <span className="text-oxblood" aria-hidden="true">★</span>
                <span className="text-ink">{Number(product.averageRating).toFixed(1)} / 5</span>
                <span className="text-bark/60">({product.reviewsCount} reviews)</span>
              </>
            ) : null}
          </div>

          <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">{formatPrice(product.price)}</p>
          <p className="text-bark leading-relaxed">{product.description}</p>
          <p className="text-sm text-bark">
            {titleCase(product.category)} style
            {product.material && <> · {product.material}</>}
            {product.occasions?.length > 0 && <> · For {product.occasions.map((o) => o.replace(/-/g, " ")).join(", ")}</>}
          </p>

          <div>
            <p className="text-sm font-medium text-ink mb-2">
              Size: <span className="text-bark font-normal">{selectedSize}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.size.map((s) => {
                const soldOut = stockFor(s, selectedColor) <= 0;
                return (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(s); setQuantity(1); }}
                    disabled={soldOut}
                    aria-pressed={selectedSize === s}
                    aria-label={soldOut ? `${s}, sold out in this colour` : s}
                    className={`min-w-12 min-h-11 px-3 border text-sm font-medium transition-colors duration-200 ${
                      soldOut
                        ? "border-hairline text-bark/50 line-through cursor-not-allowed"
                        : selectedSize === s
                          ? "bg-ink text-white border-ink cursor-pointer"
                          : "border-hairline text-ink hover:border-ink cursor-pointer"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="note text-ink mb-2">
              Color: <span className="text-bark">{titleCase(selectedColor)}</span>
            </p>
            <div className="flex items-center gap-3">
              {product.color.map((c) => (
                <button
                  key={c}
                  onClick={() => chooseColor(c)}
                  aria-label={titleCase(c)}
                  aria-pressed={selectedColor === c}
                  title={titleCase(c)}
                  className={`w-8 h-8 border-2 transition-colors duration-300 cursor-pointer ${
 selectedColor === c ?"border-ink ring-1 ring-ink ring-offset-2 ring-offset-paper":"border-hairline"
 }`}
                  style={{ backgroundColor: swatch(c) }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="note text-ink mb-2">Quantity</p>
            <div className="inline-flex items-center border border-hairline">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3 py-2.5 hover:bg-parchment transition-colors duration-300 cursor-pointer"
              >
                <FaMinus size={12} />
              </button>
              <span className="px-4 font-meta" aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                aria-label="Increase quantity"
                className="px-3 py-2.5 hover:bg-parchment transition-colors duration-300 cursor-pointer"
              >
                <FaPlus size={12} />
              </button>
            </div>
            {inStock && selectedStock <= 3 && (
              <p className="text-sm text-ink mt-2">Only {selectedStock} left in this size and colour</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="btn-ink w-full text-center disabled:bg-hairline disabled:text-bark disabled:border-hairline disabled:hover:bg-hairline disabled:cursor-not-allowed"
            >
              {!inStock ? "Sold out in this size" : adding ? "Adding…" : user ? "Add to bag" : "Log in to add to bag"}
            </button>
            <WishList product={product} />
          </div>

          {status && (
            <p role="status" className={`font-meta text-xs ${status.type ==="ok"?"text-ink":"text-oxblood"}`}>
              {status.type === "ok" ? "✓ " : ""}
              {status.text}
              {status.type === "ok" && (
                <Link to="/customer/cart" className="ml-2 underline link-draw">View cart</Link>
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
