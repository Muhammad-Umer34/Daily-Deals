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
    const productArray = [...products]; 

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage and organize your product inventory</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Total Products:</span>
              <span className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm font-medium">
                {products.length}
              </span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by product name or description..."
                  onChange={handleSearch}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Options
              </label>
              <div className="relative">
                <select 
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white appearance-none cursor-pointer"
                  onChange={handleChange}
                >
                  <option value="">Default Order</option>
                  <option value="stock_desc">Stock: High to Low</option>
                  <option value="stock_asc">Stock: Low to High</option>
                  <option value="purchased_desc">Most Purchased</option>
                  <option value="purchased_asc">Least Purchased</option>
                  <option value="views_desc">Most Viewed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="created_desc">Recently Added</option>
                  <option value="created_asc">Oldest First</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 py-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="text-center py-20">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">No products available</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by adding your first product to the inventory system.
              </p>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;