import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getProducts } from "../../features/admin/adminApi";
import ProductCard from "./productCard";
import { deleteProductApi } from "../../features/admin/adminApi";
import { useDispatch } from "react-redux";
import { productActions } from "../../features/admin/editProductSlice";
import {useNavigate} from "react-router-dom";
import { uiActions } from "../../features/admin/uiSlice";

const MyProducts = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const data = await getProducts(user, accessToken);
      console.log("Fetched products:", data);
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const deleteProduct = async (productId) => {
    try {
      const response = await deleteProductApi(productId, user, accessToken);
      fetchProducts(); 
      console.log("Product deleted successfully:", response);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }
  const editProduct = async (productId) => {
    console.log("Edit product with ID:", productId);
    const productToEdit = products.find(product => product._id === productId);
    dispatch(productActions.setProductDetails(productToEdit));
    console.log("Product to edit:", productToEdit);
    dispatch(uiActions.changeField("editProduct"));
  }
  useEffect(() => {
    if (user && accessToken) {
      fetchProducts();
    }
  }, [user, accessToken]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          deleteProduct={deleteProduct}
          editProduct={editProduct}
        />
      ))}
    </div>
  );
};
export default MyProducts;