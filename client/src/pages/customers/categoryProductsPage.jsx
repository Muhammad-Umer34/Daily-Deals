import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import Header from "../../components/ui/customer/header";
import ItemCatalog from "./itemCatalog";

const CategoryProductPage = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />

      {/* Breadcrumb wrapper */}
      <div
        className="w-full px-2 sm:px-6"
        style={{ marginTop: "calc(8vh + 16px)" }}
      >
        <div className="w-full max-w-screen-xl mx-auto">
          <BreadcrumbWithCustomSeparator />
        </div>
      </div>

      <ItemCatalog />
    </div>
  );
};

export default CategoryProductPage;
