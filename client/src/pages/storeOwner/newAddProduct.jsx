import React, { useEffect, useState } from "react";
import axios from "axios";
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
  // The shop's vocabulary (departments, categories, occasions…) comes from the server,
  // so the form can only offer values the catalogue and the AI shopper understand.
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/catalog`)
      .then((r) => setCatalog(r.data))
      .catch(() => setError("Couldn't load the category list. Please refresh."));
  }, []);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { occasions: [], seasons: [] } });
  const department = watch("genre");
  const categoriesFor = (catalog?.categories || []).filter((c) => !department || c.departments.includes(department));
  const label = (v) => v.replace(/-/g, " ").replace(/^\w/, (ch) => ch.toUpperCase());
  const selectClass = "w-full bg-white border border-hairline px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-ink";

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
      occasions,
      seasons,
      fit,
      fabricWeight,
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
      occasions: [].concat(occasions || []),
      seasons: [].concat(seasons || []),
      fit,
      fabricWeight,
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
    <div className="w-full max-w-lg mx-auto mt-10 border-t-2 border-ink p-5 max-h-[85vh] flex flex-col bg-paper">
      {/* Fixed Header */}
      <div className="flex justify-between items-center font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-5">
        <div></div>
        <h1>Add Product</h1>
        <button type="button" aria-label="Close" onClick={onClose || (() => navigate("/store/products"))} className="cursor-pointer hover:text-ink"><RxCross2 /></button>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && <p role="alert" className="bg-paper border border-oxblood/40 px-3 py-2 text-sm text-oxblood">{error}</p>}
          {/* Product Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="font-medium text-ink">Product Name</label>
            <Input
              id="name"
              type="text"
              {...register("name", { required: true })}
              placeholder="Product Name"
            />
            {errors.name && (
              <span className="text-oxblood text-sm">This field is required</span>
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
              <span className="text-oxblood text-sm">This field is required</span>
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
              <span className="text-oxblood text-sm">This field is required</span>
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
              <span className="text-oxblood text-sm">This field is required</span>
            )}
          </div>

          {/* Genre */}
          <div className="flex flex-col">
            <label htmlFor="genre">Department</label>
            <select id="genre" className={selectClass} {...register("genre", { required: true })} defaultValue="">
              <option value="" disabled>Choose a department</option>
              {(catalog?.departments || []).map((d) => <option key={d} value={d}>{label(d)}</option>)}
            </select>
            {errors.genre && (
              <span className="text-oxblood text-sm">This field is required</span>
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
              <span className="text-oxblood text-sm">This field is required</span>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label htmlFor="category">Style</label>
            <select id="category" className={selectClass} {...register("category", { required: true })} defaultValue="">
              <option value="" disabled>Choose a style</option>
              {(catalog?.styles || []).map((st) => <option key={st} value={st}>{label(st)}</option>)}
            </select>
            {errors.category && (
              <span className="text-oxblood text-sm">This field is required</span>
            )}
          </div>

          {/* SubCategory */}
          <div className="flex flex-col">
            <label htmlFor="subcategory">Category</label>
            <select id="subcategory" className={selectClass} {...register("subcategory", { required: true })} defaultValue="">
              <option value="" disabled>{department ? "Choose a category" : "Choose a department first"}</option>
              {categoriesFor.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            {errors.subcategory && (
              <span className="text-oxblood text-sm">This field is required</span>
            )}
          </div>

          {/* What it is for: shoppers and the AI shopper search by these */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1">Occasions</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {(catalog?.occasions || []).map((o) => (
                <label key={o} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={o} {...register("occasions")} className="accent-ink w-4 h-4" />
                  {label(o)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1">Seasons</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {(catalog?.seasons || []).map((se) => (
                <label key={se} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" value={se} {...register("seasons")} className="accent-ink w-4 h-4" />
                  {label(se)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label htmlFor="fit">Fit (optional)</label>
              <select id="fit" className={selectClass} {...register("fit")} defaultValue="">
                <option value="">Not set</option>
                {(catalog?.fits || []).map((x) => <option key={x} value={x}>{label(x)}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="fabricWeight">Fabric weight (optional)</label>
              <select id="fabricWeight" className={selectClass} {...register("fabricWeight")} defaultValue="">
                <option value="">Not set</option>
                {(catalog?.fabricWeights || []).map((x) => <option key={x} value={x}>{label(x)}</option>)}
              </select>
            </div>
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
              <span className="text-oxblood text-sm">This field is required</span>
            )}
          </div>

          {/* Size */}
          <div className="flex flex-col">
            <label htmlFor="size">Sizes (comma separated; stock is shared across sizes and colours)</label>
            <Input
              id="size"
              type="text"
              {...register("size", { required: true })}
              placeholder="S, M, L, XL"
            />
            {errors.size && (
              <span className="text-oxblood text-sm">This field is required</span>
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
              className="mt-1 p-2 bg-paper border border-hairline focus:outline-none focus:border-ink transition-colors"
              {...register("images", {
                required: "At least one image is required",
              })}
            />
            {errors.images && (
              <span className="text-oxblood text-sm">{errors.images.message}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 mb-4 w-[60%] py-2 px-4 note cursor-pointer transition-colors ${
 loading 
 ?"bg-bark/40 border border-bark/40 text-paper cursor-not-allowed"
 :"btn-ink"
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