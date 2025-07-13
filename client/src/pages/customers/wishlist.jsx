import { useState } from "react";
import { FaHeart, FaStar, FaMinus, FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { addToWishList,removeFromWishList } from "../../features/customer/customerApi";
const WishList = ({product})=>
{
    const user = useSelector((state) => state.auth.user);
    console.log("User in WishList:", user , user.id);
    const accessToken = useSelector((state) => state.auth.accessToken);
    const [liked, setLiked] = useState(false);
     const handleLike = () => {

        if(liked){
          setLiked(false);
          removeFromWishList(product._id,accessToken,user.id);
        }
        else{
          setLiked(true);
          addToWishList(product._id,accessToken,user.id);
      }
     }
      
  return (
          <button
                  onClick={handleLike}
                  className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-black"
                  aria-label="Add to Wishlist"
                >
                  <FaHeart
                    className={`text-xl ${
                      liked ? "text-red-500" : "text-gray-400"
                    } transition`}
                  />
                </button>
  )
}
export default WishList;