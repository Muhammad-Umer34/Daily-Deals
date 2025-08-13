import { getProductsForCustomer } from "../../features/customer/customerApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductCard from "./card";

const ShowProducts = ({ product }) => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!product) {
      const fetchProducts = async () => {
        try {
          const fetchedProducts = await getProductsForCustomer(
            user,
            accessToken
          );
          setProducts(fetchedProducts || []);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        }
      };
      fetchProducts();
    } else {
      setProducts(product || []);
    }
  }, [product, user, accessToken]); 

  return products.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 px-18">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">No products available</p>
    </div>
  );
};

export default ShowProducts;
