import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserWishList } from "../apiCalls/wishlist";
import WishListItem from "./WishListItem";

export default function DisplayWishlist() {
  const user = useSelector((state) => state.user.user);
  const accessToken = useSelector((state) => state.user.accessToken);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getUserWishList(user.id, accessToken);
        if (response.exist) {
          setItems(response.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [user.id, accessToken]);

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
      {items.length > 0 ? (
        items.map((item) => (
          <WishListItem key={item._id} item={item} onDelete={handleDelete} />
        ))
      ) : (
        <div className="text-center text-gray-500 col-span-full">No items in wishlist.</div>
      )}
    </div>
  );
}
