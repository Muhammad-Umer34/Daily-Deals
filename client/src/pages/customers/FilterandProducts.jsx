import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiSliders } from "react-icons/fi";
import Filters from "./Filters";
import ProductCard from "./card";
import SortByDropDown from "./sortByDropDown";
import { userProductActions } from "../../features/customer/productsSlice";

const PAGE_SIZE = 8;
const titleCase = (s) => (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function LayoutWithFilters({ title }) {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const { FilteredProducts: products, pageNo, category, subCategory } = useSelector((s) => s.userProducts);

  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(pageNo, pages);
  const start = (page - 1) * PAGE_SIZE;
  const visible = products.slice(start, start + PAGE_SIZE);
  const heading = title || (category === "all" && !subCategory ? "All Products" : titleCase(subCategory || category));

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            {products.length ? `${start + 1}–${start + visible.length} of ${products.length}` : "0 products"}
          </span>
          <SortByDropDown />
          <button
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-800 font-medium cursor-pointer"
          >
            <FiSliders /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-60 shrink-0`} aria-label="Filters">
          <Filters />
        </aside>

        <div className="flex-1 min-w-0">
          {visible.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {visible.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-20">No products match this selection.</p>
          )}

          {pages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
              <button
                disabled={page === 1}
                onClick={() => dispatch(userProductActions.setPageNo(page - 1))}
                className="px-3 py-2 rounded-md text-sm font-medium disabled:text-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                ‹ Previous
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch(userProductActions.setPageNo(i + 1))}
                  aria-current={i + 1 === page ? "page" : undefined}
                  className={`w-9 h-9 rounded-md text-sm font-medium cursor-pointer ${i + 1 === page ? "bg-black text-white" : "hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === pages}
                onClick={() => dispatch(userProductActions.setPageNo(page + 1))}
                className="px-3 py-2 rounded-md text-sm font-medium disabled:text-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Next ›
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
