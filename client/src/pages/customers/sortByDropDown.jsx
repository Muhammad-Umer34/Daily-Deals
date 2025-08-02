import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector, useDispatch } from "react-redux";
import { userProductActions } from "../../features/customer/productsSlice";

export default function SortByDropDown() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.userProducts.FilteredProducts) || [];
  const [selectedCategory, setSelectedCategory] = useState("newest");

  const handleOnSelect = (value) => {
    setSelectedCategory(value);
    console.log("Products are : ",products);
    const sorted = [...products]; 
    console.log("Before : ",sorted);
    if (value === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (value === "popular") {
      sorted.sort((a, b) => b.views - a.views);
    } else if (value === "price_low_high") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (value === "price_high_low") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (value === "best_rating") {
      sorted.sort((a, b) => b.averageRating - a.averageRating);
    }
    console.log("After : ",sorted);
    dispatch(userProductActions.setProducts(sorted));
  };

  const categories = [
    { label: "Newest", value: "newest" },
    { label: "Most Popular", value: "popular" },
    { label: "Price Low to High", value: "price_low_high" },
    { label: "Price High to Low", value: "price_high_low" },
    { label: "Best Rating", value: "best_rating" },
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category" className="font-medium">
        Sort by:
      </label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {categories.find((c) => c.value === selectedCategory)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          {categories.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => handleOnSelect(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
