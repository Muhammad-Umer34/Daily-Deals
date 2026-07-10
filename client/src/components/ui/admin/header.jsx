import * as React from 'react';
import { CiMenuBurger } from "react-icons/ci";

function ResponsiveAppBar() {
  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 bg-white
        flex justify-center items-center
        px-4
        h-[8vh]
        md:h-[8vh]
        lg:h-[8vh]
        border-b border-gray-200
      `}
    >
      <div className="flex-1 flex md:flex-none lg:hidden">
        <CiMenuBurger className="text-2xl text-gray-800" />
      </div>
      {/* Logo */}
      <div
        className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center select-none"
      >
        Daily<span className="text-blue-600"> Deals</span>
      </div>
      {/* Empty div for spacing on large screens */}
      <div className="hidden lg:flex flex-1"></div>
    </div>
  );
}

export default ResponsiveAppBar;