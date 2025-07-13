import { useEffect, useState } from "react";
import { FaHeart, FaStar, FaMinus, FaPlus } from "react-icons/fa";
import { ImageCarousel } from "./carouselComponent";
import ReviewBox from "./review";
import { useSelector } from "react-redux";
import { addToCart } from "../../features/customer/customerApi";
import WishList from "./wishlist";


const ProductDetailPage = ({ product }) => {
    const user = useSelector((state) => state.auth.user);
    console.log("User in ProductDetailPage:", user);
    const accessToken = useSelector((state) => state.auth.accessToken);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.color?.[0] || "");
      setSelectedSize(product.size?.[0] || "");
    }
  }, [product]);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));
  const handleLike = () => setLiked(!liked);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select color and size.");
      return;
    }
    const cartItem = {
      productId: product._id,
      userId:user.id,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      quantity,
      color:selectedColor,
      size:selectedSize,
    };
    addToCart(cartItem, accessToken)
      .then((response) => {
    console.log("Added to cart:", cartItem);
      })
      .catch((error) => {
        console.error("Failed to add to cart:", error);
        alert("Failed to add product to cart. Please try again.");
      }
    );
  };

  if (!product) {
    return <p className="text-center mt-20 text-gray-500">Product not available</p>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Carousel */}
        <div className="md:w-1/2">
          <ImageCarousel images={product.images} />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.brand_logo && (
              <img src={product.brand_logo} alt="Brand" className="h-20 w-auto" />
            )}
          </div>

          <p className="text-gray-600">{product.description}</p>

          <p className="text-xl font-bold text-blue-600">
            Rs {product.price.toLocaleString()}
          </p>

          <p className="text-sm text-gray-500">Category: {product.category}</p>

          {/* Size Selector */}
          <div>
            <p className="text-sm font-semibold">Select Size</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {product.size.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-1 rounded-full border text-sm font-medium transition-all ${
                    selectedSize === s
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <p className="text-sm font-semibold mt-4">Select Color</p>
            <div className="flex items-center gap-3 mt-1">
              {product.color.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === c
                      ? "ring-2 ring-black border-black"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: c.toLowerCase() }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mt-4">
            <p className="text-sm font-semibold mb-1">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded overflow-hidden">
                <button
                  onClick={decreaseQty}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  <FaMinus />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={increaseQty}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart + Wishlist */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-black text-white font-semibold px-6 py-3 uppercase w-full rounded hover:bg-gray-900 transition"
            >
              Add to Cart
            </button>
            <WishList product={product} />
          </div>

          {/* Rating Section */}
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{product.ratings} / 5</span>
            <span className="ml-2 text-gray-400">
              ({product.reviewsCount} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Review Section (placeholder) */}
     <ReviewBox product={product} />
    </div>
  );
};

export default ProductDetailPage;
