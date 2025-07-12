import Input from "@mui/material/Input";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";
import { CiHeart } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useEffect, useState } from "react";
import axios from "axios";
import FadeMenu from "./menu.jsx";
import useMediaQuery from "@mui/material/useMediaQuery";

const CustomerHeader = () => {
  const [flagUrl, setFlagUrl] = useState(null);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const onLgScreens = ["Profile","Logout"];
  const onMdScreens = ["Profile", "Logout", "Cart", "Wishlist"];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const apikey = "e7191120cf654ead8ed67bf53c4bbbcc";
          axios
            .get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apikey}`
            )
            .then((response) => {
              const country = response.data.results[0]?.components?.country;
              if (country) {
                axios
                  .get(`https://restcountries.com/v3.1/name/${country}`)
                  .then((response) => {
                    const countryData = response.data[0];
                    if (countryData?.flags?.svg) {
                      setFlagUrl(countryData.flags.svg);
                    }
                  })
                  .catch((error) => {
                    console.error("Error fetching country data:", error);
                  });
              }
            })
            .catch((error) => {
              console.error("Error fetching location data:", error);
            });
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-white shadow-sm border-b border-gray-100">
      {/* Logo (only on large screens) */}
      {isLargeScreen && (
        <div className="flex items-center">
          <img
            src="images/daily_deals.png"
            alt="Daily Deals"
            className="h-8 w-auto"
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-md px-2 py-1 flex-1 mx-6 max-w-2xl">
        <Input
          type="text"
          id="searchBar"
          disableUnderline
          placeholder="Search products..."
          className="bg-transparent outline-none text-gray-700 w-full"
        />
        <FaMagnifyingGlass className="ml-2 text-gray-500" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Show these only on large screens */}
        {isLargeScreen && (
          <>
            <Avatar>
              <AvatarImage src={flagUrl || "/images/4706264.jpg"} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <FaCartShopping className="text-gray-600 hover:text-blue-600 cursor-pointer text-xl" />
            <CiHeart className="text-gray-600 hover:text-red-500 cursor-pointer text-2xl" />
          </>
        )}

        {/* FadeMenu with dynamic items */}
        <FadeMenu menuItems={isLargeScreen ? onLgScreens : onMdScreens} />
      </div>
    </div>
  );
};

export default CustomerHeader;
