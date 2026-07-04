import { FaEdit, FaTrash, FaEye, FaStar } from "react-icons/fa";

const ProductCard = ({ product, deleteProduct, editProduct, onEdit }) => {

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (editProduct && typeof editProduct === 'function') {
      editProduct(product._id);
    } else {
      console.error("editProduct is not a function:", editProduct);
    }
    
    if (onEdit && typeof onEdit === 'function') {
      onEdit();
    } else {
      console.error("onEdit is not a function:", onEdit);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 w-72 p-4 flex flex-col">
      <div className="relative h-44 rounded-xl overflow-hidden bg-gray-50 mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
            product.stock > 10
              ? "bg-emerald-100 text-emerald-700"
              : product.stock > 0
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              Rs. {product.price.toLocaleString()}
            </span>

            {product.totalPurchased > 0 && (
              <div className="flex items-center gap-1 text-amber-600 text-xs">
                <FaStar className="w-3 h-3" />
                <span>{product.totalPurchased}</span>
              </div>
            )}
          </div>

          {product.views > 0 && (
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <FaEye className="w-3 h-3" />
              <span>{product.views} views</span>
            </div>
          )}

          {product.size?.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {product.size.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  {size}
                </span>
              ))}
              {product.size.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{product.size.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={handleEditClick}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-black transition cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <FaEdit className="w-3 h-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            console.log("Delete button clicked");
            deleteProduct(product._id);
          }}
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition cursor-pointer"
        >
          <FaTrash className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;