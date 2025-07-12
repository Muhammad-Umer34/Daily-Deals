import axios from 'axios'
const BASE_URL = 'http://localhost:5000/api/customer';

export const getProductsForCustomer = async (user, accessToken) => {
  const token = accessToken || user?.accessToken;
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    throw error;
  }
}

export const getProduct = async (no,accessToken)=>
{
const id = no || '';
const token = accessToken || '';
const response = await axios.get(`${BASE_URL}/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data;
}

export const addToCart = async (product, accessToken) => {
  console.log("Adding product to cart:", product);
  const token = accessToken || '';
  try {
    const response = await axios.post(`${BASE_URL}/cart`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product to cart:", error.response?.data || error.message);
    throw error;
  }
}