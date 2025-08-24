import React, { useState } from "react";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { postProduct,updateProductApi } from "../../features/admin/adminApi";
import { useSelector } from "react-redux";

const NewEditProduct = ({ onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const editProduct = useSelector((state) => state.product.product);
  const [imageUpdated, setImageUpdated] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
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

    let imagesArray = [];
    if (imageUpdated && images && images.length > 0) {
      imagesArray = Array.from(images);
    }

    const colorArray = color.split(",").map((c) => c.trim().toLowerCase());
    const sizeArray = size.split(",").map((s) => s.trim().toLowerCase());
    
    const formattedData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(quantity, 10),
      category,
      subcategory,
      color: colorArray,
      size: sizeArray,
      genre: genre,
      material,
    };

    if (imageUpdated && imagesArray.length > 0) {
      formattedData.images = imagesArray;
    }

    const finalData = { ...editProduct, ...formattedData };
    console.log("Final data:", finalData);
    await updateProductApi(imageUpdated,finalData,user,accessToken);
    
  };

  return (
    <div className="w-[30%] m-auto mt-10 border-2 p-5 rounded-lg shadow-lg h-[80vh] flex flex-col bg-white">
      <div className="flex justify-between items-center text-xl font-bold mb-5">
        <div></div>
        <h1>{editProduct ? "Edit Product" : "Add Product"}</h1>
        <RxCross2 className="cursor-pointer hover:text-red-500" onClick={onClose} />
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="name">Product Name</label>
            <Input
              id="name"
              type="text"
              defaultValue={editProduct?.name || ""}
              {...register("name", { required: "Product name is required" })}
              placeholder="Product Name"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="description">Description</label>
            <TextField
              id="description"
              multiline
              rows={3}
              defaultValue={editProduct?.description || ""}
              {...register("description", { required: "Description is required" })}
              placeholder="Description"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="price">Price</label>
            <Input
              id="price"
              type="number"
              step="0.01"
              defaultValue={editProduct?.price || ""}
              {...register("price", { 
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" }
              })}
              placeholder="Price"
            />
            {errors.price && (
              <span className="text-red-500 text-sm">{errors.price.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              defaultValue={editProduct?.stock || editProduct?.quantity || ""}
              {...register("quantity", { 
                required: "Quantity is required", 
                min: { value: 0, message: "Quantity must be non-negative" }
              })}
              placeholder="Quantity"
            />
            {errors.quantity && (
              <span className="text-red-500 text-sm">{errors.quantity.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="genre">Genre</label>
            <Input
              id="genre"
              type="text"
              defaultValue={editProduct?.genre || ""}
              {...register("genre", { required: "Genre is required" })}
              placeholder="Kids, Men, Women, Unisex"
            />
            {errors.genre && (
              <span className="text-red-500 text-sm">{errors.genre.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="material">Material</label>
            <Input
              id="material"
              type="text"
              defaultValue={editProduct?.material || ""}
              {...register("material", { required: "Material is required" })}
              placeholder="Cotton, Polyester"
            />
            {errors.material && (
              <span className="text-red-500 text-sm">{errors.material.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="category">Category</label>
            <Input
              id="category"
              type="text"
              defaultValue={editProduct?.category || ""}
              {...register("category", { required: "Category is required" })}
              placeholder="Category"
            />
            {errors.category && (
              <span className="text-red-500 text-sm">{errors.category.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="subcategory">SubCategory</label>
            <Input
              id="subcategory"
              type="text"
              defaultValue={editProduct?.subcategory || ""}
              {...register("subcategory", { required: "SubCategory is required" })}
              placeholder="SubCategory"
            />
            {errors.subcategory && (
              <span className="text-red-500 text-sm">{errors.subcategory.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="color">Color (Comma Separated)</label>
            <Input
              id="color"
              type="text"
              defaultValue={editProduct?.colors?.join(", ") || editProduct?.color?.join(", ") || ""}
              {...register("color", { required: "At least one color is required" })}
              placeholder="Red, Blue, Green"
            />
            {errors.color && (
              <span className="text-red-500 text-sm">{errors.color.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="size">Size (Comma Separated)</label>
            <Input
              id="size"
              type="text"
              defaultValue={editProduct?.sizes?.join(", ") || editProduct?.size?.join(", ") || ""}
              {...register("size", { required: "At least one size is required" })}
              placeholder="S, M, L, XL"
            />
            {errors.size && (
              <span className="text-red-500 text-sm">{errors.size.message}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="images">Images</label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={() => setImageUpdated(true)}
              className="mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              {...register("images", {
                required: editProduct ? false : "At least one image is required",
              })}
            />
            {errors.images && (
              <span className="text-red-500 text-sm">{errors.images.message}</span>
            )}
            {editProduct && !imageUpdated && (
              <small className="text-gray-500 mt-1">
                Current images will be preserved. Upload new images only if you want to replace them.
              </small>
            )}
          </div>
          
          <button
            type="submit"
            className="mt-4 mb-4 w-[60%] bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors self-center"
          >
            {editProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEditProduct;