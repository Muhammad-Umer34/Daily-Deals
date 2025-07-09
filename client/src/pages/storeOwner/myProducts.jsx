import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProducts, deleteProductApi } from "../../features/admin/adminApi";
import ProductCard from "./productCard";
import { productActions } from "../../features/admin/editProductSlice";
import { uiActions } from "../../features/admin/uiSlice";

const MyProducts = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      const data = await getProducts(user, accessToken);
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await deleteProductApi(productId, user, accessToken);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const editProduct = (productId) => {
    const productToEdit = products.find((product) => product._id === productId);
    dispatch(productActions.setProductDetails(productToEdit));
    dispatch(uiActions.changeField("editProduct"));
  };

  useEffect(() => {
    if (user && accessToken) {
      fetchProducts();
    }
  }, [user, accessToken]);

  const handleSearch = (e) => {
    if (e.target.value === "") {
      fetchProducts();
      return;
    }
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    setProducts(filteredProducts);
  };
  
const handleChange = (e) => {
  const val = e.target.value;
  const productArray = [...products]; // Make a copy to avoid mutating original state

  switch (val) {
    case "stock_desc":
      setProducts(productArray.sort((a, b) => b.stock - a.stock));
      break;

    case "stock_asc":
      setProducts(productArray.sort((a, b) => a.stock - b.stock));
      break;

    case "price_desc":
      setProducts(productArray.sort((a, b) => b.price - a.price));
      break;

    case "price_asc":
      setProducts(productArray.sort((a, b) => a.price - b.price));
      break;

    case "created_desc":
      setProducts(productArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      break;

    case "created_asc":
      setProducts(productArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      break;

    case "purchased_desc":
      setProducts(productArray.sort((a, b) => b.totalPurchased - a.totalPurchased));
      break;

    case "purchased_asc":
      setProducts(productArray.sort((a, b) => a.totalPurchased - b.totalPurchased));
      break;

    case "views_desc":
      setProducts(productArray.sort((a, b) => b.views - a.views));
      break;

    default:
      setProducts(productArray); 
      break;
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-blue-800 flex items-center gap-2">
            🛍️ My Products
          </h1>
        </div>

        {/* Search + Sort Controls */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-100 p-6 rounded-2xl shadow-md mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="🔍 Search by name or description..."
              onChange={handleSearch}
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
          </div>

          {/* Sort */}
          <select className="w-full md:w-1/3 px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white appearance-none"
          onChange={handleChange}
          >
            <option value="">📊 Sort By</option>
            <option value="stock_desc">Quantity: High to Low</option>
            <option value="stock_asc" >Quantity: Low to High</option>
            <option value="purchased_desc">Most Purchased</option>
            <option value="purchased_asc">Least Purchased</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="views_desc">Most Viewed</option>
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
          </select>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                deleteProduct={deleteProduct}
                editProduct={editProduct}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center text-gray-600 text-xl mt-20">
            😕 No products found. Try adding some!
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
