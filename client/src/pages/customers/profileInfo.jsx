import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/ui/customer/header";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import { navActions } from "../../features/customer/navSlice";
import { authActions } from "../../features/auth/authSlices";
import { useNavigate } from "react-router-dom";

import { FiUser, FiShoppingCart, FiHeart, FiClock, FiLogOut } from "react-icons/fi";
import CartPage from "./cart";
import DisplayWishlist from "./displayWishlist";
import GetOrShowInfo from "./gettingInfo";
import OrderHistory from "./orderHistory";


const tabItems = [
  { name: 'Profile Information', icon: <FiUser size={16} /> },
  { name: 'Cart', icon: <FiShoppingCart size={16} /> },
  { name: 'WishList', icon: <FiHeart size={16} /> },
  { name: 'Order History', icon: <FiClock size={16} /> },
  { name: 'Sign Out', icon: <FiLogOut size={16} />, isDanger: true },
];

const ProfileForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const active = useSelector((state) => state.navActive.active);

  const handleOnClick = (value) => {
    if (value === 'Sign Out') {
      dispatch(authActions.logout());
      navigate("/login");
    } else {
      dispatch(navActions.setActive(value));
    }
  };

  return (
    <>
      <Header />
      <div className="mt-[100px] px-10">
        <BreadcrumbWithCustomSeparator />
        <div className="border-b border-gray-300 mt-6 px-[10%]">
          <div className="flex justify-between">
            {tabItems.map(({ name, icon, isDanger }) => (
              <button
                key={name}
                onClick={() => handleOnClick(name)}
                className={`flex items-center gap-2 py-4 text-sm font-medium relative cursor-pointer px-4
                  ${name === active ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-black' : ''}
                  ${isDanger ? 'text-red-500 hover:text-red-600' : 'text-gray-800 hover:text-black'}`}
              >
                <span className={`flex items-center ${isDanger ? 'text-red-500' : ''}`}>
                  {icon}
                </span>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {active === 'Cart' && <CartPage/>}
      {active === 'WishList' && <DisplayWishlist/>}
      {active === 'Profile Information' && <GetOrShowInfo/>}
      {active === 'Order History' && <OrderHistory/>}
    </>
  );
};

export default ProfileForm;
