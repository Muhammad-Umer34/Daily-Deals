import { FaCartPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { removeFromWishList } from "../../features/customer/customerApi";
import { useState } from "react";

export default function WishListItem({ item,onDelete }) {
  console.log(item);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const { product, createdAt } = item;
  const formattedDate = new Date(createdAt).toLocaleDateString();
  const handleAddToCart = ()=>{
   navigate(`/home/${product.category}/${product.subcategory}/${product._id}`)
  }

  const handleRemoveFromCart = async ()=>{
     await  removeFromWishList(product._id, accessToken, user.id);
     onDelete(item._id);
  }
  return (
    <div className="flex justify-between items-center border p-4 rounded-lg shadow-sm mb-4">
      <div className="flex gap-4 w-1/2">
        <div className="w-24 h-24">
          <img
            src={product?.images?.[0]}
            alt={product?.name || "Product"}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div>
          <div className="font-semibold text-lg">{product?.name}</div>
          <div className="text-sm text-gray-500">Added on {formattedDate}</div>
        </div>
      </div>

      <div className="flex w-1/2 justify-between items-center">
        <div className="text-lg font-bold">Rs. {product?.price}</div>
           <div
          className={`px-3 py-1 rounded-full border text-sm font-semibold mb-2
          ${
            item.product?.stock > 0
              ? "bg-green-100 border-green-300 text-green-700"
              : "bg-red-100 border-red-300 text-red-700"
          }`}
        >
          {item.product?.stock > 0 ? "In Stock" : "Out of Stock"}
        </div>

         <div className="flex gap-3">
          <button className="text-black hover:scale-110 transition-transform cursor-pointer" title="Add to Cart"
          onClick={handleAddToCart}>
            <FaCartPlus size={18} />
          </button>
          <button className="text-red-600 hover:scale-110 transition-transform cursor-pointer" title="Remove"
          onClick={handleRemoveFromCart}>
            <FaTrash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
