import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

import { postProduct } from "../../features/admin/adminApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { uiActions } from "../../features/admin/uiSlice";

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = [
    "Red", "Blue", "Black", "White", "Green", "Yellow", "Purple", "Orange", "Gray", "Pink",
    "Maroon", "Navy", "Teal", "Brown", "Olive", "Beige", "Cyan", "Lime", "Gold", "Silver",
  ];

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const toggleSelection = (value, list, setList, name) => {
    const newList = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setList(newList);
    setValue(name, newList);
  };

  const onSubmit = (data) => {
    console.log("Product data submitted:", data);
    postProduct(data,user, accessToken);
   dispatch(uiActions.changeField(field.name));
  };

  return (
    <div className="min-h-screen bg-[#ECEFF4] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Name */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product Description here"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 30,
                  message: "Description should be at least 30 characters",
                },
              })}
            />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>

          {/* Price + Quantity in one row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full bg-[#F5F6FA] p-4 rounded-md space-y-2">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
              />
              {errors.price && <p className="text-red-500">{errors.price.message}</p>}
            </div>
            <div className="w-full bg-[#F5F6FA] p-4 rounded-md space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                })}
              />
              {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              {...register("category", { required: "Category is required" })}
              className="w-full border border-gray-300 p-2 rounded-md bg-white"
              defaultValue=""
            >
              <option disabled value="">Select a category</option>
              <option>Electronics</option>
              <option>Fashion & Apparel</option>
              <option>Health & Beauty</option>
              <option>Automotive</option>
              <option>Home & Kitchen</option>
              <option>Groceries & Essentials</option>
              <option>Sports & Outdoors</option>
              <option>Toys & Baby Products</option>
              <option>Books & Stationery</option>
              <option>Computers & Accessories</option>
            </select>
            {errors.category && <p className="text-red-500">{errors.category.message}</p>}
          </div>

          {/* Image Upload */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              {...register("images", { required: "At least one image is required" })}
            />
            {errors.images && <p className="text-red-500">{errors.images.message}</p>}
          </div>

          {/* Sizes */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label>Available Sizes</Label>
            <div className="flex flex-wrap gap-4">
              {sizes.map((size) => (
                <label key={size} className="flex items-center gap-2 text-gray-800">
                  <Checkbox
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() =>
                      toggleSelection(size, selectedSizes, setSelectedSizes, "sizes")
                    }
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-[#F5F6FA] p-4 rounded-md space-y-2">
            <Label>Available Colors</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {colors.map((color) => (
                <label key={color} className="flex items-center gap-2 text-gray-800">
                  <Checkbox
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() =>
                      toggleSelection(color, selectedColors, setSelectedColors, "colors")
                    }
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition duration-200"
            >
              Submit Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
