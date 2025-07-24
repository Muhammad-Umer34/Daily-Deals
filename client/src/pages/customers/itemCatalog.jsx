import SortByDropDown from "./sortByDropDown";
const ItemCatalog = () => {
  return (
    <div
      className="w-full flex flex-row items-center mt-5 py-4"
      style={{ marginLeft: "5%", marginRight: "5%" }}
    >
      {/* Left: Filters */}
      <div className="flex items-center" style={{ width: "15%" }}>
        <h1 className="font-bold text-gray-800 text-xl">Filters</h1>
      </div>

      {/* Gap between divs */}
      <div style={{ width: "5%" }}></div>

      {/* Right: New Arrivals, Showing, Sort */}
      <div
        className="flex flex-row items-center justify-between gap-6 text-sm text-gray-600"
        style={{ width: "70%" }}
      >
        <h1 className="text-2xl font-bold text-gray-900">New Arrivals</h1>
        <div className="flex flex-row items-center gap-6">
          <p className="mb-0 font-semibold text-gray-400">
            Showing 7–11 of 11 Products
          </p>
          <SortByDropDown />
        </div>
      </div>
    </div>
  );
};

export default ItemCatalog;
