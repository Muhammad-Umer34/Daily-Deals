import * as React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useDispatch } from "react-redux";
import { filterActions } from "../../../features/customer/filterSlice";

function valuetext(value) {
  return `${value}`;
}

export default function RangeSlider({ min = 0, max = 100 }) {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState([min, max]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    dispatch(filterActions.setPrice({ min: newValue[0], max: newValue[1] }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Slider
        getAriaLabel={() => "Range"}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        min={min}
        max={max}
      />
    </Box>
  );
}
