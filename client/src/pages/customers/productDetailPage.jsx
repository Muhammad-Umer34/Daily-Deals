import { useParams } from "react-router-dom";
import {getProduct} from "../../features/customer/customerApi";
import {ImageCarousel} from "./carouselComponent"
import { useEffect, useState } from "react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(id);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    };
    fetchProduct();
  }, [id]);
  return (
    <div>
     <ImageCarousel images={product.images} />
    </div>
  );
}
export default ProductDetailPage;