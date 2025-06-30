import axios from "axios"

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
  console.log(response.data);
  return response.data;
}