import { FaTrash, FaHeart, FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";
import { updateCartQuantity } from "../../features/customer/customerApi";
import { useSelector } from "react-redux";

const CartItem = ({ item, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const updateQuantity = async (newQuantity)=>
  {
    console.log(item._id,user.id,accessToken,newQuantity);
    await updateCartQuantity(item.productId,user.id,accessToken,newQuantity);
  }
  return (
    <div className="border rounded-lg p-4 shadow mb-4 bg-white w-full flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-auto flex justify-center md:justify-start">
        <img
          src={item.image}
          alt={item.name}
          className="w-28 h-28 object-cover rounded"
        />
      </div>

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

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="font-bold text-lg">Rs. {item.price * quantity}</p>

          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <button
                className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 shadow hover:bg-gray-200 transition cursor-pointer"
                onClick={async () => {
                  if (quantity >= 1) {
                    setQuantity(quantity - 1);
                    await updateQuantity(quantity -1 );
                  }
                }}
              >
                <FaMinus size={10} />
              </button>

              <strong className="text-sm font-medium w-6 text-center">
                {quantity}
              </strong>

              <button
                className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 shadow hover:bg-gray-200 transition cursor-pointer"
                onClick={async () => {
                  setQuantity(quantity + 1);
                 await updateQuantity(quantity +1);
                }}
              >
                <FaPlus size={10} />
              </button>
            </div>

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
