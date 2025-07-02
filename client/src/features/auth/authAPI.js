import axios from "axios"
import { authActions}  from "./authSlices";

const BASE_URL = "http://localhost:5000/api/auth";

export const customerregisterForm = async (userObj)=>{
  const userData = {
    email:userObj.email,
    name:userObj.name,
    password:userObj.password,
    userType:"customer",
  }
   const response = await axios.post(`${BASE_URL}/register`, userData, {
    withCredentials: true, 
  });
  console.log("Response data is ",response.data);
  return response.data;
};

export const storeregisterForm = async (userObj) => {
  const data = new FormData();

  const safeBrandName = userObj.name.replace(/\s+/g, "_").toLowerCase();
  
  const originalFile = userObj.brand_logo[0];
  const fileExtension = originalFile.name.split(".").pop();
  const newFileName = `${safeBrandName}_logo.${fileExtension}`;

  const renamedFile = new File([originalFile], newFileName, {
    type: originalFile.type,
  });
  console.log("Renamed file is ", renamedFile);
  data.append("file", renamedFile);
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
  };
  console.log("User data is ", userData);
  const response = await axios.post(`${BASE_URL}/register`, userData, {
    withCredentials: true,
  });

  console.log("Response data is ", response.data);
  return response.data;
};


export const loginForm = async (userObj)=>{
   const userData = {
    email:userObj.email,
    password:userObj.password
  }
  const response = await axios.post(`${BASE_URL}/login`,userData,{withCredentials:true,});
   return response.data;
}