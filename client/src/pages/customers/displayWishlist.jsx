import { useEffect, useState } from "react";
import { getUserWishlist } from "../../features/customer/customerApi";
import WishListItem from "./wishlistItem";
import { useSelector } from "react-redux";

export default function DisplayWishlist() {
  const [items, setItems] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  function onDelete (itemId){
      const filteredItems = items.filter((item) => item._id !== itemId);
      setItems(filteredItems);
  }
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const result = await getUserWishlist(user.id,accessToken);
        setItems(result);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="mt-8 mx-60">
      <div>
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      </div>

      <div className="flex justify-between mb-6 px-4 font-bold text-xl">
        <div className="w-1/2">Product</div>
        <div className="w-1/2 flex justify-between">
          <div>Price</div>
          <div>Status</div>
          <div>Action</div>
        </div>
      </div>

      {items.length > 0 ? (
        items.map((item) => <WishListItem key={item._id} item={item} onDelete={onDelete} />)
      ) : (
        <div className="text-center text-gray-500 mt-10">No items in wishlist.</div>
      )}
    </div>
  );
}