import { FaShoppingCart, FaEdit, FaTrash } from 'react-icons/fa';

const ProductCard = ({ product,deleteProduct,editProduct }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-4 w-full max-w-sm transition-transform hover:scale-[1.02] duration-300 cursor-pointer">
      {/* Image box */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4 h-56 flex items-center justify-center overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full object-contain"
        />
      </div>

      {/* Name */}
      <h3 className="text-md font-semibold text-gray-800 mb-2">{product.name}</h3>

      {/* Colors */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-500">Colors:</span>
        {product.color.map((color, index) => (
          <span
            key={index}
            className="w-4 h-4 rounded-full border"
            title={color}
            style={{ backgroundColor: color.toLowerCase() }}
          ></span>
        ))}
      </div>

      {/* Sizes */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-500">Sizes:</span>
        {product.size.map((size, index) => (
          <span
            key={index}
            className="text-xs bg-gray-200 px-2 py-0.5 rounded-full font-medium"
          >
            {size}
          </span>
        ))}
      </div>

      {/* Price + Stock */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-indigo-900">
          PKR {product.price.toLocaleString()}
        </div>
        <div className={`text-sm px-2 py-0.5 rounded-full font-medium ${product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-600'}`}>
          {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
        </div>
      </div>

      {/* Edit & Delete Buttons */}
      <div className="flex justify-between gap-2">
        <button className="w-1/2 bg-yellow-400 text-white flex items-center justify-center gap-2 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-300 cursor-pointer" onClick={()=>{editProduct(product._id)}} >
          <FaEdit />
          Edit
        </button>
        <button className="w-1/2 bg-red-500 text-white flex items-center justify-center gap-2 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 cursor-pointer" onClick={()=>{deleteProduct(product._id)}} >
          <FaTrash />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
