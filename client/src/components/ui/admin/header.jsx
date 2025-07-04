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
      {/* Hamburger: visible only on small/medium screens */}
      <div className="flex-1 flex md:flex-none lg:hidden">
        <CiMenuBurger className="text-2xl text-gray-800" />
      </div>
      {/* Logo */}
      <div
        className={`
          flex-1 flex justify-end
          md:justify-end
          lg:justify-center
        `}
      >
        <img
          src="images/daily_deals_logo.ico"
          alt="Daily Deals logo"
          className="h-8 md:h-10 lg:h-12"
        />
      </div>
      {/* Empty div for spacing on large screens */}
      <div className="hidden lg:flex flex-1"></div>
    </div>
  );
}

export default ResponsiveAppBar;