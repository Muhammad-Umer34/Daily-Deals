import axios from "axios";
import { authActions } from "./authSlices";
import { useState } from "react";

const BASE_URL = "http://localhost:5000/api/auth";


export const customerregisterForm = async (userObj) => {
  const userData = {
    email: userObj.email,
    name: userObj.name,
    password: userObj.password,
    userType: "customer",
  };

  try {
    const response = await axios.post(`${BASE_URL}/register/customer`, userData, {
      withCredentials: true,
    });
    console.log("Response data is", response.data);
    return response.data;
  } catch (error) {
    console.log("Error in customerregisterForm:", error.response.data);
    handleAxiosError(error);
    throw error;
  }
};

export const storeregisterForm = async (userObj) => {
  try {
    const data = new FormData();

    data.append("file", userObj.brand_logo[0]);
    data.append("upload_preset", "daily_deals");
    data.append("cloud_name", "dz2py1xii");

    const imageinfo = await axios.post(
      "https://api.cloudinary.com/v1_1/dz2py1xii/image/upload",
      data
    );
    const userData = {
      email: userObj.email,
      name: userObj.ownerName,
      password: userObj.password,
      userType: "storeOwner",
      brand_logo: imageinfo.data.url,
      brand_name: userObj.name,
      confirmPassword: userObj.confirmPassword,
    };
    console.log("User data is", userData);
    const response = await axios.post(`${BASE_URL}/register/store`, userData, {
      withCredentials: true,
    });

    console.log("Response data is", response.data);
    return response.data;
  } catch (error) {
    console.log("Error in storeregisterForm:", error.response.data);
    handleAxiosError(error);
    throw error;
  }
};

export const loginForm = async (userObj) => {
  const userData = {
    email: userObj.email,
    password: userObj.password,
  };

  try {
    const response = await axios.post(`${BASE_URL}/login`, userData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};
function handleAxiosError(error) {
  if (error.response) {
    console.error("Server responded with error:", error.response.status);
    console.error("Error message:", error.response.data.message);
    alert(error.response.data.message || "Request failed");
  } else if (error.request) {
    console.error("No response from server:", error.request);
    alert("No response from server. Please try again.");
  } else {
    console.error("Axios error:", error.message);
    alert("An error occurred: " + error.message);
  }
}
