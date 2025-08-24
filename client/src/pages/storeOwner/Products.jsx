import NewHeader from "../../components/ui/admin/newHeader";
import MyProducts from "./myProducts";
import { BiSearch } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { storeOwnerProductsActions } from "../../features/admin/myProductsSlice";
import { getProducts } from "../../features/admin/adminApi";
import { RiFilter2Fill } from "react-icons/ri";
import SortDropdown from "./dropdown";

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.storeOwnerProducts.products);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    console.log(e.target.value);
    if (e.target.value === "") {
      dispatch(storeOwnerProductsActions.setProducts(products));
    } else {
      const value = e.target.value.toLowerCase();
      const filteredProducts = products.filter((product) => {
        return product.name.toLowerCase().includes(value);
      });
      dispatch(storeOwnerProductsActions.filterProducts(filteredProducts));
    }
  };
  const fetchP = async () => {
    const data = await getProducts(user, accessToken);
    dispatch(storeOwnerProductsActions.setProducts(data));
  };
  useEffect(() => {
    fetchP();
  }, [user, accessToken]);
  return (
    <div>
      <NewHeader />
      <div className="mt-10 mb-5 ml-70 mr-70 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>

        <div className="flex gap-3 items-center">
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e)}
              placeholder="Search..."
              className="border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm
          focus:outline-none focus:border-blue-500 focus:shadow-md
          transition-all duration-300 w-40 focus:w-56"
            />
            <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button className="px-4 py-1 rounded-lg bg-black text-white border-2 border-black hover:bg-gray-800 transition cursor-pointer">
            Add Product
          </button>
          <SortDropdown/>
        </div>
      </div>

      <MyProducts />
    </div>
  );
};
export default Products;
