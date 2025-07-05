import axios from "axios";
import { useSelector } from "react-redux";
const BASE_URL = "http://localhost:5000/api/store";


export const postProduct = async (productData,user,accessToken) => {
 
  console.log("User is", user);
  console.log("Access token is", accessToken);
  console.log("Product data is", productData);
  const imageArray = [];

  for (const image of productData.images) {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "daily_deals");
    data.append("cloud_name", "dz2py1xii");

    const imageinfo = await axios.post(
      "https://api.cloudinary.com/v1_1/dz2py1xii/image/upload",
      data
    );

    imageArray.push(imageinfo.data.url);
  }

  const productInfo = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    quantity: productData.quantity,
    category: productData.category,
    images: imageArray,
    size: productData.sizes || [],
    color: productData.colors || [],
    user:user,
  };

 
  const token = accessToken || user?.accessToken; 

  try {
    console.log("Sending product info:", productInfo);
    const response = await axios.post(`${BASE_URL}/products`, productInfo, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    console.log("Product added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error.response?.data || error.message);
    throw error;
  }
};
