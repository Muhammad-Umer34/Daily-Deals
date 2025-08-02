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
    "Red",
    "Blue",
    "Black",
    "White",
    "Green",
    "Yellow",
    "Purple",
    "Orange",
    "Gray",
    "Pink",
    "Maroon",
    "Navy",
    "Teal",
    "Brown",
    "Olive",
    "Beige",
    "Cyan",
    "Lime",
    "Gold",
    "Silver",
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
    console.log(data);
    postProduct(data, user, accessToken);
    dispatch(uiActions.changeField(field.name));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center py-0 px-0 border border-gray-200 shadow-2xl">
      <div className="w-full h-full bg-white p-8 sm:p-12 md:p-16 rounded-none shadow-none border-none mx-0 my-0 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">
          Add Product
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 w-full max-w-4xl mx-auto"
        >
          {/* Product Name */}
          <div>
            <Label
              htmlFor="name"
              className="text-base font-semibold text-gray-700"
            >
              Product Name
            </Label>
            <Input
              id="name"
              placeholder="Product name"
              {...register("name", { required: "Product name is required" })}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              className="text-base font-semibold text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Product Description"
              {...register("description", {
                required: "Description is required",
                minLength: { value: 30, message: "At least 30 characters" },
              })}
              className="mt-2"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="price"
                className="text-base font-semibold text-gray-700"
              >
                Price (PKR)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Price"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                className="mt-2"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="quantity"
                className="text-base font-semibold text-gray-700"
              >
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Quantity"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "At least 1" },
                })}
                className="mt-2"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Genre */}
          <div>
            <Label className="text-base font-semibold text-gray-700">
              Target Genre
            </Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {["Kids", "Men", "Women", "Unisex"].map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="radio"
                    value={genre}
                    {...register("genre", { required: "Select a genre" })}
                    className="accent-green-600"
                  />
                  {genre}
                </label>
              ))}
            </div>
            {errors.genre && (
              <p className="text-red-500 text-xs mt-1">
                {errors.genre.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label className="text-base font-semibold text-gray-700">
              Category
            </Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                "Casual",
                "Gymwear",
                "Formal",
                "Party",
                "Loungewear",
                "Sportswear",
                "Beachwear",
              ].map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <input
                    type="radio"
                    value={category}
                    {...register("category", { required: "Select a category" })}
                    className="accent-green-600"
                  />
                  {category}
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Subcategory */}
          <div>
            <Label
              htmlFor="subcategory"
              className="text-base font-semibold text-gray-700"
            >
              Subcategory
            </Label>
            <Input
              id="subcategory"
              placeholder="e.g. Shirts, Jackets, Baby Wear"
              {...register("subcategory", {
                required: "Subcategory is required",
              })}
              className="mt-2"
            />
            {errors.subcategory && (
              <p className="text-red-500 text-xs mt-1">
                {errors.subcategory.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="material"
              className="text-base font-semibold text-gray-700"
            >
              Material
            </Label>
            <Input
              id="material"
              placeholder="e.g. Cotton, Denim, Leather"
              {...register("material", { required: "Material is Required" })}
              className="mt-2"
            />
            {errors.material && (
              <p className="text-red-500 text-xs mt-1">
                {errors.material.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label
              htmlFor="images"
              className="text-base font-semibold text-gray-700"
            >
              Product Images
            </Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              {...register("images", {
                required: "At least one image is required",
              })}
              className="mt-2"
            />
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">
                {errors.images.message}
              </p>
            )}
          </div>

          {/* Sizes */}
          <div>
            <Label className="text-base font-semibold text-gray-700">
              Available Sizes
            </Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {sizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <Checkbox
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() =>
                      toggleSelection(
                        size,
                        selectedSizes,
                        setSelectedSizes,
                        "sizes"
                      )
                    }
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label className="text-base font-semibold text-gray-700">
              Available Colors
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {colors.map((color) => (
                <label
                  key={color}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <Checkbox
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() =>
                      toggleSelection(
                        color,
                        selectedColors,
                        setSelectedColors,
                        "colors"
                      )
                    }
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition duration-200"
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
