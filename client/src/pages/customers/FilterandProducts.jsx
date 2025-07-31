import Filters from "./Filters";
import { useSelector } from "react-redux";
import ProductCard from "./card";

export default function LayoutWithFilters() {
  const products = useSelector((state) => state.userProducts.FilteredProducts);
  console.log(products);

  return (
    <div className="mx-[5%] mt-[3%] flex">
      {/* Filters Section */}
      <div className="w-[20%]">
        <Filters />
      </div>
       <div className="w-[5%]"></div>
      {/* Product Grid */}
      <div className="w-[75%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
