import { FaShoppingCart, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const ProductCard = ({ product, deleteProduct, editProduct }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-gray-900">
            PKR {product.price.toLocaleString()}
          </span>
        </div>

        {/* Product Details */}
        <div className="space-y-2 mb-4">
          {/* Colors */}
          {product.color && product.color.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium w-12">Colors:</span>
              <div className="flex gap-1">
                {product.color.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                    title={color}
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
                {product.color.length > 4 && (
                  <span className="text-xs text-gray-400 ml-1">+{product.color.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.size && product.size.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium w-12">Sizes:</span>
              <div className="flex gap-1 flex-wrap">
                {product.size.slice(0, 3).map((size, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                  >
                    {size}
                  </span>
                ))}
                {product.size.length > 3 && (
                  <span className="text-xs text-gray-400">+{product.size.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium w-12">Stock:</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              product.stock > 10 
                ? 'bg-green-100 text-green-700' 
                : product.stock > 0 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
            </span>
          </div>

          {/* Performance Metrics */}
          {(product.views > 0 || product.totalPurchased > 0) && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              {product.views > 0 && (
                <div className="flex items-center gap-1">
                  <FaEye className="w-3 h-3" />
                  <span>{product.views} views</span>
                </div>
              )}
              {product.totalPurchased > 0 && (
                <div className="flex items-center gap-1">
                  <FaShoppingCart className="w-3 h-3" />
                  <span>{product.totalPurchased} sold</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button 
            className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 px-3 rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
            onClick={() => editProduct(product._id)}
          >
            <FaEdit className="w-3 h-3" />
            Edit
          </button>
          <button 
            className="bg-red-50 text-red-600 text-sm font-medium py-2.5 px-3 rounded-md hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2 border border-red-200"
            onClick={() => deleteProduct(product._id)}
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;