import { useParams } from "react-router-dom";
import { getProduct } from "../../features/customer/customerApi";
import { ImageCarousel } from "./carouselComponent";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductInfo from "./productInfo";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(id,accessToken);
        setProduct(response);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ProductInfo product={product} />
      {/* <ImageCarousel images={product.images || []} /> */}
      {/* Add more product info here as needed */}
    </div>
  );
};

export default ProductDetailPage;
