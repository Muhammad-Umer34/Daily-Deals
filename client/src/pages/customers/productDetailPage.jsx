import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct, increaseOrderViews } from "../../features/customer/customerApi";
import ProductInfo from "./productInfo";
import Header from "../../components/ui/customer/header";
import Footer from "./footer";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setProduct(null);
    setFailed(false);
    getProduct(id)
      .then((p) => {
        setProduct(p);
        increaseOrderViews(p._id).catch(() => {});
      })
      .catch(() => setFailed(true));
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <main className="flex-1 pt-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto mb-6">
          <BreadcrumbWithCustomSeparator productName={product?.name} />
        </div>
        {product ? (
          <ProductInfo product={product} />
        ) : (
          <p className="text-center text-gray-500 py-24">{failed ? "This product is no longer available." : "Loading product…"}</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
