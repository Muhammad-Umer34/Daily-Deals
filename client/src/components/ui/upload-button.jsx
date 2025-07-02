
import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PropTypes from "prop-types";


const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const InputFileUpload = React.forwardRef(({ onChange, ...props }, ref) => {
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Upload Logo
      <VisuallyHiddenInput
        type="file"
        {...props}
        ref={ref}
        onChange={(e) => {
          onChange && onChange(e); 
          props.onChange && props.onChange(e); 
        }}
      />
    </Button>
  );
});

InputFileUpload.displayName = "InputFileUpload";

InputFileUpload.propTypes = {
  onChange: PropTypes.func,
};

export default InputFileUpload;
