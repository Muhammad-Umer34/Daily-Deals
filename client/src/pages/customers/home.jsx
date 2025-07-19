import CustomerHeader from "../../components/ui/customer/header";
import ShowProducts from "./showProducts";
import HeroSection from "../../components/ui/customer/heroSection";
import Separator from "../../components/ui/customer/separator";
import DisplayCategories from "./displayCategories";

const CustomerHome = () => {
  return (
    <div className="light flex flex-col min-h-screen w-full bg-white">
      <CustomerHeader />
      <HeroSection />
      <Separator name="New Arrival"/>
      <ShowProducts/>
      <Separator name="Top Selling"/>
      <ShowProducts/>
      <Separator name = "Shop By Category"/>
      <Separator name = "Dress Styles"/>
      <DisplayCategories/>

      {/* Add more sections/components below as needed */}
    </div>
  );
};

export default CustomerHome;