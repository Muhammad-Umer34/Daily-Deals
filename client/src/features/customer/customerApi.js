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

export const getProduct = (no)=>
{
const id = no || '';
return axios.get(`${BASE_URL}/product/${id}`)
}