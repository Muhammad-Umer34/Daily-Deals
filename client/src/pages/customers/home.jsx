import CustomerHeader from "../../components/ui/customer/header";
import ShowProducts from "./showProducts";
import HeroSection from "../../components/ui/customer/heroSection";
import Separator from "../../components/ui/customer/separator";
import DisplayCategories from "./displayCategories";
import Footer from "./footer";
import { getTopSellingProducts, getProductsForCustomer } from "../../features/customer/customerApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CustomerHome = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [newArrival, setNewArrival] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topViewed, setTopViewed] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await getTopSellingProducts(user, accessToken);
        setNewArrival(response.newArrival || []);
        setTopProducts(response.topProducts || []);
        setTopViewed(response.topViewed || []);
      } catch (error) {
        console.error("Failed to fetch top selling products:", error);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const response = await getProductsForCustomer(user, accessToken);
        setAllProducts(response || []);
      } catch (error) {
        console.error("Failed to fetch all products:", error);
      }
    };

    fetchTopSellingProducts();
    fetchAllProducts();
  }, [user, accessToken]);

  return (
    <div className="light flex flex-col min-h-screen w-full bg-white">
      <CustomerHeader />
      <HeroSection />
      <Separator name="New Arrival" />
      <ShowProducts product={newArrival} />
      <Separator name="Top Selling" />
      <ShowProducts product={topProducts} />
      <Separator name="Top Viewed" />
      <ShowProducts product={topViewed} />
      <Separator name="Shop By Category" />
      <Separator name="Dress Styles" />
      <DisplayCategories name="Dress Styles" allProducts={allProducts} />
      <Separator name="Shop By Gender" />
      <DisplayCategories name="Shop By Gender" allProducts={allProducts} />
      <Footer />
    </div>
  );
};

export default CustomerHome;
