import { FaTrash, FaHeart, FaSearch } from "react-icons/fa";

const CartItem = ({ item, onRemove }) => {
  return (
    <div className="border rounded-lg p-4 shadow mb-4 bg-white w-full flex flex-col md:flex-row gap-4">
      {/* Image */}
      <div className="w-full md:w-auto flex justify-center md:justify-start">
        <img
          src={item.image}
          alt={item.name}
          className="w-28 h-28 object-cover rounded"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-base md:text-lg mb-1 line-clamp-2">
            {item.name}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-block text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full text-black">
              {item.color} / {item.size}
            </span>
            <span className="text-sm text-amber-600 inline-flex items-center">
              👍 100+ 5-star reviews
            </span>
          </div>
        </div>

        {/* Bottom section: Price, Qty, Icons */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="font-bold text-lg">Rs. {item.price}</p>

          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>
              Qty: <strong>{item.quantity}</strong>
            </span>

            <button className="hover:text-black text-gray-500">
              <FaSearch />
            </button>
            <button className="hover:text-red-500 text-gray-500">
              <FaHeart />
            </button>
            <button
              onClick={() => onRemove(item._id)}
              className="hover:text-red-700 text-gray-500"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
