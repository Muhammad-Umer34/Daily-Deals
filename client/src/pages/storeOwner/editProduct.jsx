import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { postProduct } from "../../features/admin/adminApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { productActions } from "../../features/admin/editProductSlice";
import { updateProductApi } from "../../features/admin/adminApi";
import { uiActions } from "../../features/admin/uiSlice";

const EditProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const product = useSelector((state) => state.product.product);
  const imageUpdated = useSelector((state) => state.product.imageUpdated);
  
  const sizesList = ["S", "M", "L", "XL", "XXL"];
  const colorsList = [
    "Red", "Blue", "Black", "White", "Green", "Yellow", "Purple", "Orange", "Gray", "Pink",
    "Maroon", "Navy", "Teal", "Brown", "Olive", "Beige", "Cyan", "Lime", "Gold", "Silver",
  ];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (product && Object.keys(product).length > 0) {
      reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        quantity: product.quantity || product.stock || 0,
        genre: product.genre || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        material: product.material || "",
      });

      const sizes = product.size || product.sizes || [];
      const colors = product.color || product.colors || [];

      setSelectedSizes(sizes);
      setSelectedColors(colors);
      setValue("sizes", sizes);
      setValue("colors", colors);

      setImagePreviews(product.images || []);
    }
  }, [product, reset, setValue]);

  const toggleSelection = (value, list, setList, name) => {
    const newList = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setList(newList);
    setValue(name, newList);
  };

  const onSubmit = (data) => {
    const updatedProduct = {
      ...product,
      ...data,
      sizes: selectedSizes,
      colors: selectedColors,
      size: selectedSizes,
      color: selectedColors,
      stock: data.quantity,
      images: data.images?.length ? data.images : product.images,
    };
    delete updatedProduct.quantity;
    
    updateProductApi(imageUpdated, updatedProduct, user, accessToken)
      .then(() => {
        dispatch(productActions.resetProductDetails());
        dispatch(uiActions.changeField("My Products"));
      })
      .catch((error) => {
        console.error("Error updating product:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600 mt-1">Update product information and settings</p>
            </div>
            <button
              onClick={() => dispatch(uiActions.changeField("My Products"))}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Product Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
                  <Input 
                    id="name" 
                    {...register("name", { required: "Product name is required" })} 
                    className="mt-1"
                    placeholder="Enter product name" 
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">Subcategory</Label>
                  <Input
                    id="subcategory"
                    placeholder="e.g., Shirts, Jackets, Baby Wear"
                    {...register("subcategory", { required: "Subcategory is required" })}
                    className="mt-1"
                  />
                  {errors.subcategory && <p className="text-xs text-red-600 mt-1">{errors.subcategory.message}</p>}
                </div>

                <div>
                  <Label htmlFor="material" className="text-sm font-medium text-gray-700">Material</Label>
                  <Input
                    id="material"
                    placeholder="e.g., Cotton, Denim, Leather"
                    {...register("material", { required: "Material is required" })}
                    className="mt-1"
                  />
                  {errors.material && <p className="text-xs text-red-600 mt-1">{errors.material.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price (PKR)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    {...register("price", { 
                      required: "Price is required", 
                      min: { value: 0, message: "Must be positive" } 
                    })} 
                    className="mt-1"
                    placeholder="0" 
                  />
                  {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Stock Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    {...register("quantity", { 
                      required: "Quantity is required", 
                      min: { value: 0, message: "Must be positive" } 
                    })} 
                    className="mt-1"
                    placeholder="0" 
                  />
                  {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Target Genre</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Kids", "Men", "Women", "Unisex"].map((genre) => (
                      <label key={genre} className="flex items-center text-sm">
                        <input
                          type="radio"
                          value={genre}
                          {...register("genre", { required: "Select a genre" })}
                          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span className="ml-2 text-gray-700">{genre}</span>
                      </label>
                    ))}
                  </div>
                  {errors.genre && <p className="text-xs text-red-600">{errors.genre.message}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea 
                id="description" 
                {...register("description", { 
                  required: "Description is required", 
                  minLength: { value: 30, message: "At least 30 characters required" } 
                })} 
                className="mt-1 min-h-[100px]"
                placeholder="Describe your product..." 
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Category</h2>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Product Category</Label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {["Casual", "Gymwear", "Formal", "Party", "Loungewear", "Sportswear", "Beachwear"].map((category) => (
                  <label key={category} className="flex items-center text-sm">
                    <input
                      type="radio"
                      value={category}
                      {...register("category", { required: "Select a category" })}
                      className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                    />
                    <span className="ml-2 text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>
            
            <div>
              <Label htmlFor="images" className="text-sm font-medium text-gray-700">Upload Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                {...register("images")}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const previews = files.map((file) => URL.createObjectURL(file));
                  dispatch(productActions.setImageUpdated(true));
                  setImagePreviews(previews);
                }}
                className="mt-1"
              />
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="aspect-square">
                      <img 
                        src={src} 
                        alt={`Preview ${idx + 1}`} 
                        className="w-full h-full object-cover rounded border border-gray-200" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Variants</h2>
            
            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Available Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sizesList.map((size) => (
                    <label key={size} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSelection(size, selectedSizes, setSelectedSizes, "sizes")}
                        className="sr-only"
                      />
                      <div className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}>
                        {size}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Available Colors</Label>
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                  {colorsList.map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleSelection(color, selectedColors, setSelectedColors, "colors")}
                        className="sr-only"
                      />
                      <div className={`px-3 py-2 border rounded text-xs font-medium transition-colors text-center ${
                        selectedColors.includes(color)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}>
                        {color}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => dispatch(uiActions.changeField("My Products"))}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;