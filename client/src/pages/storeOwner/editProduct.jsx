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
        stock: product.stock || 0,
        category: product.category || "",
      });

      const sizes = product.size || [];
      const colors = product.color || [];

      setSelectedSizes(sizes);
      setSelectedColors(colors);
      setValue("size", sizes);
      setValue("color", colors);

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
      size: selectedSizes,
      color: selectedColors,
      images: data.images?.length ? data.images : product.images,
    };
    delete updatedProduct.quantity;
    console.log("Updated product:", updatedProduct);
    console.log("Image updated:", imageUpdated);
    updateProductApi(imageUpdated,updatedProduct, user, accessToken)
      .then(() => {
        dispatch(productActions.resetProductDetails());
        dispatch (uiActions.changeField("My Products"));
      })
      .catch((error) => {
        console.error("Error updating product:", error);
      });

  };

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800">
            Edit Product
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Update your product information below.
          </p>
          <div className="w-32 h-1 bg-gray-300 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10 md:p-14">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">Product Name</Label>
                <Input id="name" {...register("name", { required: "Product name is required" })} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-black" placeholder="Enter product name" />
                {errors.name && <p className="text-red-500 mt-2">⚠️ {errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="category" className="block mb-2 text-sm font-semibold text-gray-700">Category</Label>
                <select id="category" {...register("category", { required: "Category is required" })} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-black">
                  <option value="">Select a category</option>
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
                {errors.category && <p className="text-red-500 mt-2">⚠️ {errors.category.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-700">Description</Label>
              <Textarea id="description" {...register("description", { required: "Description is required", minLength: { value: 30, message: "At least 30 characters required" } })} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-black min-h-[120px]" placeholder="Describe your product in detail..." />
              {errors.description && <p className="text-red-500 mt-2">⚠️ {errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="price" className="block mb-2 text-sm font-semibold text-gray-700">Price ($)</Label>
                <Input id="price" type="number" {...register("price", { required: "Price is required", min: { value: 0, message: "Must be positive" } })} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-black" placeholder="0.00" />
                {errors.price && <p className="text-red-500 mt-2">⚠️ {errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="stock" className="block mb-2 text-sm font-semibold text-gray-700">Stock</Label>
                <Input id="stock" type="number" {...register("stock", { required: "Stock is required", min: { value: 1, message: "Must be at least 1" } })} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-black" placeholder="1" />
                {errors.stock && <p className="text-red-500 mt-2">⚠️ {errors.stock.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="images" className="block mb-2 text-sm font-semibold text-gray-700">Product Images</Label>
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
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-white border border-gray-300 rounded-xl"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="block mb-4 text-sm font-semibold text-gray-700">Available Sizes</Label>
              <div className="flex flex-wrap gap-3">
                {sizesList.map((size) => (
                  <label key={size} className="relative cursor-pointer">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 font-semibold text-sm transition-all ${
                      selectedSizes.includes(size)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-black border-gray-300'
                    }`}>
                      {size}
                    </div>
                    <Checkbox
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSelection(size, selectedSizes, setSelectedSizes, "size")}
                      className="absolute inset-0 opacity-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="block mb-4 text-sm font-semibold text-gray-700">Available Colors</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {colorsList.map((color) => (
                  <label key={color} className="relative cursor-pointer">
                    <div className={`px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all text-center ${
                      selectedColors.includes(color)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-black border-gray-300'
                    }`}>
                      {color}
                    </div>
                    <Checkbox
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => toggleSelection(color, selectedColors, setSelectedColors, "color")}
                      className="absolute inset-0 opacity-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-4 px-8 rounded-xl text-lg font-semibold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition duration-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
