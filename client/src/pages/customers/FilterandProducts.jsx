import Filters from "./Filters";
import { useSelector, useDispatch } from "react-redux";
import ProductCard from "./card";
import { PaginationDemo } from "./Pagination";
import { userProductActions } from "../../features/customer/productsSlice";

export default function LayoutWithFilters() {
  const dispatch = useDispatch();
  let products = useSelector((state) => state.userProducts.FilteredProducts);
  const pageNo = useSelector((state) => state.userProducts.pageNo);
  
  const startingIndex = (pageNo - 1) * 8;
  let endingIndex = startingIndex + 8;
  if (endingIndex > products.length) {
    endingIndex = products.length;
  }

  const paginatedProducts = products.slice(startingIndex, endingIndex);

  dispatch(userProductActions.setTotalProducts(products.length));
  dispatch(userProductActions.setStartIndex(startingIndex));
  dispatch(userProductActions.setEndIndex(endingIndex));

  return (
    <div className="mx-[5%] mt-[3%] flex">
      <div className="w-[20%]">
        <Filters />
      </div>
      <div className="w-[5%]"></div>
      <div className="w-[75%] flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {paginatedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="mt-10">
          <PaginationDemo />
        </div>
      </div>
    </div>
  );
}
