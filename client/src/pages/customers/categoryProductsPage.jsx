import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import Header from "../../components/ui/customer/header";
import { getProductByCategory } from "../../features/customer/customerApi";
import { userProductActions } from "../../features/customer/productsSlice";
import LayoutWithFilters from "./FilterandProducts";
import Footer from "./footer";

// Serves /home/:category, /home/:category/:subcategory and search (/home/all?q=...).
const CategoryProductPage = () => {
  const dispatch = useDispatch();
  const { category, subcategory } = useParams();
  const q = useSearchParams()[0].get("q")?.trim().toLowerCase() || "";

  useEffect(() => {
    dispatch(userProductActions.setCategory(category));
    dispatch(userProductActions.setSubCategory(subcategory || null));
    dispatch(userProductActions.setProducts([]));
    getProductByCategory(category)
      .then((products) =>
        products.filter(
          (p) =>
            (!subcategory || p.subcategory === subcategory.toLowerCase()) &&
            (!q || `${p.name} ${p.description} ${p.brand}`.toLowerCase().includes(q))
        )
      )
      .then((products) => dispatch(userProductActions.setProducts(products)))
      .catch((error) => console.error("Failed to fetch products:", error));
  }, [category, subcategory, q, dispatch]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <div className="pt-16 flex-1">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6">
          <BreadcrumbWithCustomSeparator />
        </div>
        <LayoutWithFilters title={q ? `Results for "${q}"` : null} />
      </div>
      <Footer />
    </div>
  );
};

export default CategoryProductPage;
