import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SortByDropDown() {
  // Set "newest" as default
  const [selectedCategory, setSelectedCategory] = useState("newest");

  const categories = [
    { label: "Newest", value: "newest" },
    { label: "Most Popular", value: "popular" },
    { label: "Price Low to High", value: "price_low_high" },
    { label: "Price High to Low", value: "price_high_low" },
    { label: "Best Rating", value: "best_rating" }
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
              onSelect={() => setSelectedCategory(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
