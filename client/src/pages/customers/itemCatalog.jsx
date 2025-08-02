import SortByDropDown from "./sortByDropDown";
import { useSelector } from "react-redux";

const ItemCatalog = () => {
  const rawCategory = useSelector((state) => state.userProducts?.category || "");
  const startingIndex = useSelector((state) => state.userProducts?.startIndex || 0);
  const endingIndex = useSelector((state) => state.userProducts?.endIndex || 0);
  const totalProducts = useSelector((state) => state.userProducts?.totalProducts || 0);

  const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const category = capitalize(rawCategory);

  return (
    <div
      className="w-full flex flex-row items-center mt-5 py-4"
      style={{ marginLeft: "5%", marginRight: "5%" }}
    >
      <div className="flex items-center" style={{ width: "20%" }}>
        <h1 className="font-bold text-gray-800 text-xl">Filters</h1>
      </div>

      <div style={{ width: "5%" }}></div>

      <div
        className="flex flex-row items-center justify-between gap-6 text-sm text-gray-600"
        style={{ width: "65%" }}
      >
        <h1 className="text-2xl font-bold text-gray-900">{category}</h1>
        <div className="flex flex-row items-center gap-6">
          <p className="mb-0 font-semibold text-gray-400">
           {startingIndex + 1} - {endingIndex} of {totalProducts}
          </p>
          <SortByDropDown />
        </div>
      </div>
    </div>
  );
};

export default ItemCatalog;
