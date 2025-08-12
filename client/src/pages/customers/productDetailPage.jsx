import { useParams } from "react-router-dom";
import { getProduct } from "../../features/customer/customerApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductInfo from "./productInfo";
import Header from "../../components/ui/customer/header";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import { increaseOrderViews } from "../../features/customer/customerApi";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(id, accessToken);
        setProduct(response);
        await increaseOrderViews(response._id,response.views+1);
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
    <div className="relative">
      <Header />
      <div className="pt-[80px] px-4">
        <ProductInfo product={product} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
