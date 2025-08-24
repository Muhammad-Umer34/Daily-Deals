import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProducts, deleteProductApi } from "../../features/admin/adminApi";
import ProductCard from "./productCard";
import { productActions } from "../../features/admin/editProductSlice";
import { uiActions } from "../../features/admin/uiSlice";
import { storeOwnerProductsActions } from "../../features/admin/myProductsSlice";

const MyProducts = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const products = useSelector(
    (state) => state.storeOwnerProducts.filteredProducts
  );
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      const data = await getProducts(user, accessToken);
      dispatch(storeOwnerProductsActions.setProducts(data));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                No products available
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by adding your first product to the inventory
                system.
              </p>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors">
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
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
