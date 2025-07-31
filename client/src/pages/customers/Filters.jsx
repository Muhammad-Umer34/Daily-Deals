import FilterDropdown from "./FilterDropDown";
import { useSelector, useDispatch } from "react-redux";
import { filterActions } from "../../features/customer/filterSlice";
import RangeSlider from "../../components/ui/customer/rangeSlider";
import ColorFilterDropdown from "./colorFilterDropDown";
import { userProductActions } from "../../features/customer/productsSlice";
import { useMemo } from "react";

const Filters = () => {
  const dispatch = useDispatch();
  let m = 0;

  const products = useSelector((state) => state.userProducts.products || []);
  products.forEach((product) => {
    if (product.price > m) {
      m = product.price;
    }
  });
  const selectedFilters = useSelector((state) => state.filter || {});

  const ResetFilters = () => {
    console.log("Resetting filters...");
    dispatch(filterActions.resetFilters({min:0,max:m}));
    dispatch(userProductActions.setFilteredProducts(products));
  };
const applyFilters = () => {
  if (!Array.isArray(products)) {
    console.error("Products is not an array:", products);
    return;
  }

  const {
    size,
    color,
    brand,
    material,
    rating,
    price: { min = 0, max = Infinity } = {},
  } = selectedFilters;

  const minVal = Number(min) || 0;
  const maxVal = Number(max) || Infinity;

  console.log("Applying filters:", selectedFilters);

  const filtered = products.filter((product) => {

    if (size && !product.size?.includes(size)) return false;
    if (color && !product.color?.includes(color)) return false;
    if (brand && product.brand !== brand) return false;
    if (material && product.material !== material) return false;
    if (rating && Number(product.averageRating) !== Number(rating)) return false;

    const productPrice = Number(product.price);
    return productPrice >= minVal && productPrice <= maxVal;
  });

  dispatch(userProductActions.setFilteredProducts(filtered));
};


  const { size, color, brand, material, max } = useMemo(() => {
    const sizeSet = new Set();
    const colorSet = new Set();
    const brandSet = new Set();
    const materialSet = new Set();
    let maxPrice = 0;

    products.forEach((product) => {
      if (product.price > maxPrice) {maxPrice = product.price;
        console.log("Max Price is : ",maxPrice);
      }
      

      (Array.isArray(product.size) ? product.size : [product.size || ""])
        .filter(Boolean)
        .forEach((s) => sizeSet.add(s));

      (Array.isArray(product.color) ? product.color : [product.color || ""])
        .filter(Boolean)
        .forEach((c) => colorSet.add(c));

      if (product.brand) brandSet.add(product.brand);
      if (product.material) materialSet.add(product.material);
    });

    return {
      size: Array.from(sizeSet),
      color: Array.from(colorSet),
      brand: Array.from(brandSet),
      material: Array.from(materialSet),
      max: maxPrice,
    };
  }, [products]);

  const min = 0;
  const Ratings = ["1", "2", "3", "4", "5"];

  return (
    <div className="w-full">
      <RangeSlider min={min} max={max} />
      <FilterDropdown
        label="Size"
        options={size}
        selected={selectedFilters.size}
        onChange={(value) => dispatch(filterActions.setSize(value))}
      />
      <ColorFilterDropdown
        label="Color"
        options={color}
        selected={selectedFilters.color}
        onChange={(value) => dispatch(filterActions.setColor(value))}
      />
      <FilterDropdown
        label="Brand"
        options={brand}
        selected={selectedFilters.brand}
        onChange={(value) => dispatch(filterActions.setBrand(value))}
      />
      <FilterDropdown
        label="Material"
        options={material}
        selected={selectedFilters.material}
        onChange={(value) => dispatch(filterActions.setMaterial(value))}
      />
      <FilterDropdown
        label="Rating"
        options={Ratings}
        selected={selectedFilters.rating}
        onChange={(value) => dispatch(filterActions.setRating(value))}
      />
      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={applyFilters}
          className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200 cursor-pointer"
        >
          Apply Filters
        </button>
        <button
          onClick={ResetFilters}
          className="bg-white text-black border border-black py-2 px-4 rounded-md hover:bg-gray-100 transition duration-200 cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;