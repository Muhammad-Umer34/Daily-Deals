"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSelector, useDispatch } from "react-redux"
import { storeOwnerProductsActions } from "../../features/admin/myProductsSlice"

export default function SortDropdown({ value, onChange }) {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.storeOwnerProducts.filteredProducts)

  const handleSelect = (val) => {
    console.log("Sort option clicked:", val)
    onChange?.(val)

    let sorted = [...products] 

    switch (val) {
      case "stock_desc":
        sorted.sort((a, b) => b.stock - a.stock)
        break
      case "stock_asc":
        sorted.sort((a, b) => a.stock - b.stock)
        break
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price) 
        break
      case "created_desc":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "created_asc":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "purchased_desc":
        sorted.sort((a, b) => b.totalPurchased - a.totalPurchased)
        break
      case "purchased_asc":
        sorted.sort((a, b) => a.totalPurchased - b.totalPurchased)
        break
      case "views_desc":
        sorted.sort((a, b) => b.views - a.views)
        break
      default:
        break
    }

    dispatch(storeOwnerProductsActions.filterProducts(sorted))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {value
            ? {
                stock_desc: "Stock: High to Low",
                stock_asc: "Stock: Low to High",
                purchased_desc: "Most Purchased",
                purchased_asc: "Least Purchased",
                views_desc: "Most Viewed",
                price_asc: "Price: Low to High",
                price_desc: "Price: High to Low",
                created_desc: "Recently Added",
                created_asc: "Oldest First",
              }[value]
            : "Default Order"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={handleSelect}>
          <DropdownMenuRadioItem value="">Default Order</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="stock_desc">Stock: High to Low</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="stock_asc">Stock: Low to High</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="purchased_desc">Most Purchased</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="purchased_asc">Least Purchased</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="views_desc">Most Viewed</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price_asc">Price: Low to High</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price_desc">Price: High to Low</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created_desc">Recently Added</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created_asc">Oldest First</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
