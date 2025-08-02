import { FaUserCircle, FaShoppingCart } from 'react-icons/fa';
import { BiSearch } from 'react-icons/bi';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector, useDispatch } from 'react-redux';
import { activeActions } from '../../../features/customer/activeSlice';
import HeaderDropdown from './headerDropdown';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeField = useSelector((state) => state.active.activeField);
  const [search, setSearch] = useState('');

  const navDropdownItems = {
    Home: ['New Arrivals', 'Best Sellers', 'Trending Now'],
    Men: ['T-Shirts', 'Shirts', 'Jeans', 'Jackets', 'Shoes'],
    Women: ['Dresses', 'Tops', 'Skirts', 'Shoes', 'Accessories'],
    Kids: ['Boys Clothing', 'Girls Clothing', 'Baby Wear'],
    Categories: ['Casual Wear', 'Formal Wear', 'Sportswear', 'Accessories'],
  };

  const handleOnChangeField = (field) => {
    dispatch(activeActions.changeField(field));
    if(field!=='Home' || field !== 'home')
    {
       navigate(`/home/${field.toLowerCase()}`);
    }
    else{
 navigate("/home");
    }
    
  };

  const navLinks = ["Home", "Men", "Women", "Kids", "Categories"];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-6 py-3 flex items-center justify-between">
      <div className="text-2xl font-bold text-blue-600">
        <img src="/images/daily_deals.png" alt="Daily Deals Logo" className="h-8" />
      </div>

      <nav className="hidden md:flex gap-6 font-medium text-sm">
        {navLinks.map((link) => (
          <div key={link} className="relative group">
            <button
              onClick={() => handleOnChangeField(link)}
              className={`${
                activeField === link ? 'text-black font-semibold' : 'text-gray-400'
              } transition-colors duration-200 cursor-pointer`}
            >
              {link}
            </button>
            <HeaderDropdown items={navDropdownItems[link]} />
          </div>
        ))}
      </nav>

      {/* Right: Search + Icons */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded-full pl-4 pr-8 py-1 text-sm 
             focus:outline-none focus:border-blue-500 focus:shadow-md 
             transition-all duration-300 w-32 focus:w-52"
          />
          <BiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Flag (Avatar) */}
        <div className="w-5 h-5">
          <Avatar className="w-full h-full">
            <AvatarImage src="/images/pakistan.png" />
            <AvatarFallback>PK</AvatarFallback>
          </Avatar>
        </div>

        {/* Cart Icon */}
        <FaShoppingCart size={20} className="text-gray-700 cursor-pointer" />

        {/* Profile Icon */}
        <FaUserCircle size={22} className="text-gray-700 cursor-pointer" onClick={()=>navigate("/home/profile")} />
      </div>
    </header>
  );
}
