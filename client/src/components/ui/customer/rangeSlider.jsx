import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useDispatch } from "react-redux";
import { filterActions } from "../../../features/customer/filterSlice";
import { formatPrice } from "@/lib/utils";

export default function RangeSlider({ min = 0, max = 100 }) {
  const dispatch = useDispatch();
  const [value, setValue] = useState([min, max]);

  // Products load after mount, so re-open the range whenever the price bounds change.
  useEffect(() => {
    setValue([min, max]);
    dispatch(filterActions.setPrice({ min, max }));
  }, [min, max, dispatch]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    dispatch(filterActions.setPrice({ min: newValue[0], max: newValue[1] }));
  };

  return (
    <Box sx={{ width: "100%" }}>
      <p className="text-base font-semibold text-gray-800">Price</p>
      <Slider
        getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={formatPrice}
        min={min}
        max={max}
        disabled={max <= min}
        sx={{ color: "#000" }}
      />
      <div className="flex justify-between text-xs text-gray-500 -mt-1">
        <span>{formatPrice(value[0])}</span>
        <span>{formatPrice(value[1])}</span>
      </div>
    </Box>
  );
}
