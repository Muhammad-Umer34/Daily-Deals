import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import Header from "../../components/ui/customer/header";
import ItemCatalog from "./itemCatalog";
import { useLocation } from "react-router-dom";
import { getProductByCategory } from "../../features/customer/customerApi";
import { useEffect } from "react";
import Filters from "./Filters";
import { useDispatch } from "react-redux";
import { userProductActions } from "../../features/customer/productsSlice";
import LayoutWithFilters from "./FilterandProducts";
import Footer from "./footer";

const CategorySubCategoryProductPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const subcategory = location.pathname.split("/").pop();
  const category = location.pathname.split("/")[2];

  useEffect(() => {
    dispatch(userProductActions.setCategory(category));
    dispatch(userProductActions.setSubCategory(subcategory));
    const fetchProducts = async () => {
      try {
        const products = await getProductByCategory(category);
        console.log(products);
        console.log(subcategory);
        const filteredProducts = products.filter(
          (product) => product.subcategory === subcategory.toLowerCase()
        );
        dispatch(userProductActions.setProducts(filteredProducts));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [category, dispatch]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />
      <div
        className="w-full px-2 sm:px-6"
        style={{ marginTop: "calc(8vh + 16px)" }}
      >
        <div className="w-full max-w-screen-xl mx-auto">
          <BreadcrumbWithCustomSeparator />
        </div>
      </div>

      <ItemCatalog />
      <LayoutWithFilters />
      <div className="mt-10"></div>
      <Footer />
    </div>
  );
};

export default  CategorySubCategoryProductPage;
