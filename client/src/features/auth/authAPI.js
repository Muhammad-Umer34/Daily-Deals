import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth`;


export const customerregisterForm = async (userObj) => {
  const userData = {
    email: userObj.email,
    name: userObj.name,
    password: userObj.password,
    userType: "customer",
    address:null,
    phoneNumber:null,
  };

  try {
    const response = await axios.post(`${BASE_URL}/register/customer`, userData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
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
    const response = await axios.post(`${BASE_URL}/register/store`, userData, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
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

export const forgotPasswordAPI = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/forgot-password`, { email }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const resetPasswordAPI = async (email, pin, newPassword) => {
  try {
    const response = await axios.post(`${BASE_URL}/reset-password`, { email, pin, newPassword }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export const socialLoginAPI = async (supabaseToken) => {
  try {
    const response = await axios.post(`${BASE_URL}/social-login`, { supabaseToken }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// Puts a readable message on the error for the form to show inline (validation errors come as an array).
function handleAxiosError(error) {
  const data = error.response?.data;
  error.userMessage = error.response
    ? data?.message || data?.errors?.[0]?.msg || "Something went wrong. Please try again."
    : "Can't reach the server. Check your connection and try again.";
}
