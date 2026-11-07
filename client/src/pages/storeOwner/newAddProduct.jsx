import React, { useState } from "react";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { postProduct } from "../../features/admin/adminApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const NewAddProduct = ({ onClose, onProductAdded }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  console.log(user);
  console.log(accessToken);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const {
      name,
      description,
      price,
      quantity,
      category,
      subcategory,
      color,
      size,
      images,
      genre,
      material,
    } = data;
    const imagesArray = Array.from(images);
    const colorArray = color.split(",").map((c) => c.trim().toLowerCase());
    const sizeArray = size.split(",").map((s) => s.trim().toLowerCase());
    const formattedData = {
      name,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      category,
      subcategory,
      colors: colorArray,
      sizes: sizeArray,
      images: imagesArray,
      genre: genre,
      material,
    };
    setError("");
    try {
      await postProduct(formattedData, user, accessToken);
      if (onProductAdded) {
        await onProductAdded();
      }
      if (onClose) {
        onClose();
      } else {
        navigate("/store/products");
      }
    } catch (error) {
      setError(error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || "Couldn't add the product. Please check the fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10 border border-gray-200 p-5 rounded-xl shadow-lg max-h-[85vh] flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="flex justify-between items-center text-xl font-bold mb-5">
        <div></div>
        <h1>Add Product</h1>
        <button type="button" aria-label="Close" onClick={onClose || (() => navigate("/store/products"))} className="cursor-pointer hover:text-red-500"><RxCross2 /></button>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && <p role="alert" className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
          {/* Product Name */}
          <div className="flex flex-col">
            <label htmlFor="name">Product Name</label>
            <Input
              id="name"
              type="text"
              {...register("name", { required: true })}
              placeholder="Product Name"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label htmlFor="description">Description</label>
            <TextField
              id="description"
              multiline
              rows={3}
              {...register("description", { required: true })}
              placeholder="Description"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label htmlFor="price">Price</label>
            <Input
              id="price"
              type="number"
              {...register("price", { required: true })}
              placeholder="Price"
            />
            {errors.price && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { required: true, min: 0 })}
              placeholder=""
            />
            {errors.genre && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Genre */}
          <div className="flex flex-col">
            <label htmlFor="genre">Genre</label>
            <Input
              id="genre"
              type="text"
              {...register("genre", { required: true })}
              placeholder="Kids, Men, Women, Unisex"
            />
            {errors.genre && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Material */}
          <div className="flex flex-col">
            <label htmlFor="material">Material</label>
            <Input
              id="material"
              type="text"
              {...register("material", { required: true })}
              placeholder="Cotton, Polyester"
            />
            {errors.material && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label htmlFor="category">Category</label>
            <Input
              id="category"
              type="text"
              {...register("category", { required: true })}
              placeholder="Category"
            />
            {errors.category && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* SubCategory */}
          <div className="flex flex-col">
            <label htmlFor="subcategory">SubCategory</label>
            <Input
              id="subcategory"
              type="text"
              {...register("subcategory", { required: true })}
              placeholder="SubCategory"
            />
            {errors.subcategory && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Color */}
          <div className="flex flex-col">
            <label htmlFor="color">Color (Comma Separated)</label>
            <Input
              id="color"
              type="text"
              {...register("color", { required: true })}
              placeholder="Red, Blue, Green"
            />
            {errors.color && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Size */}
          <div className="flex flex-col">
            <label htmlFor="size">Size (Comma Separated)</label>
            <Input
              id="size"
              type="text"
              {...register("size", { required: true })}
              placeholder="S, M, L, XL"
            />
            {errors.size && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
          </div>

          {/* Images */}
          <div className="flex flex-col">
            <label htmlFor="images">Images</label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              {...register("images", {
                required: "At least one image is required",
              })}
            />
            {errors.images && (
              <span className="text-red-500 text-sm">{errors.images.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 mb-4 w-[60%] py-2 px-4 rounded-lg text-white self-center transition-colors ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-black hover:bg-gray-800 cursor-pointer"
            }`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewAddProduct;