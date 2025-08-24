import { FiUser, FiLogOut } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { uiActions } from "../../../features/admin/uiSlice";
import { useNavigate } from "react-router-dom";

const NewHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const selectedField = useSelector((state) => state.ui.selectedField);

  const navLinks = ["Dashboard", "Products", "Order", "Profile"];

  const handleClick = (link) => {
    dispatch(uiActions.changeField(link));
    navigate(`/store/${link.toLowerCase()}`);

  };

  return (
    <header className="flex justify-between items-center px-10 py-4 bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-black">Daily Deals</h1>

      <nav className="flex gap-6">
        {navLinks.map((link, i) => (
          <button
            key={i}
            onClick={() => handleClick(link)}
            className={`font-medium transition-colors duration-200 cursor-pointer ${
              selectedField === link
                ? "text-black  border-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {link}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-700">
          <FiUser className="text-xl" />
          <span className="font-medium">{user?.name || "Guest"}</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 transition duration-200 cursor-pointer">
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default NewHeader;
