import axios from "axios"
import { authActions}  from "./authSlices";

const BASE_URL = "http://localhost:5000/api/auth";

export const registerForm = async (userObj)=>{
  const userData = {
    email:userObj.email,
    name:userObj.name,
    password:userObj.password,
    userType:userObj.userType
  }
   const response = await axios.post(`${BASE_URL}/register`, userData, {
    withCredentials: true, 
  });
  console.log("Response data is ",response.data);
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