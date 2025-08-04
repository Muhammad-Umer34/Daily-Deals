import axios from "axios";

const BASE_URL = "http://localhost:5000/api/customer";

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
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getProduct = async (id, accessToken) => {
  const token = accessToken || "";
  try {
    const response = await axios.get(`${BASE_URL}/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching product:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addToCart = async (product, accessToken) => {
  console.log("Adding product to cart:", product);
  const token = accessToken || "";
  try {
    const response = await axios.post(`${BASE_URL}/cart`, product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding product to cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const removeFromWishList = async (productId, accessToken, userId) => {
  const token = accessToken || "";
  try {
    const response = await axios.delete(`${BASE_URL}/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error removing product from wishlist:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addToWishList = async (product, accessToken, userId) => {
  console.log("add to wishlist called", product);
  const token = accessToken;
  const productId = product._id;
  try {
    const response = await axios.post(
      `${BASE_URL}/wishlist/${productId}/${userId}`,
      { product: product },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding product to wishlist:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const checkWishList = async (productId, accessToken, userId) => {
  const token = accessToken || "";
  try {
    const response = await axios.get(
      `${BASE_URL}/wishlist/${productId}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error checking wishlist:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const postReview = async (productId, reviewData, accessToken) => {
  const token = accessToken || "";
  try {
    const response = await axios.post(
      `${BASE_URL}/review/${productId}`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error posting review:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllReviews = async (productId, accessToken, userId) => {
  const token = accessToken || "";
  try {
    const response = await axios.get(`${BASE_URL}/review/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching review:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCardItems = async (userId, accessToken) => {
  const token = accessToken || "";
  try {
    const response = await axios.get(`${BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching cart items:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteCartItem = async (itemId, accessToken, userId) => {
  const token = accessToken || "";
  try {
    const response = await axios.delete(`${BASE_URL}/cart/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { userId },
    });
    return response.data;
  } catch (error) {
    console.log(
      "Error deleting cart item:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getProductByCategory = async (category) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/category/products/${category}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching products by category:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateCartQuantity = async (
  productId,
  userId,
  accessToken,
  quantity
) => {
  const token = accessToken || "";

  try {
    const response = await axios.put(
      `${BASE_URL}/cart/${productId}`,
      { user: userId, quantity: quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error Updating Quantity:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUserWishlist = async (userId, accessToken) => {
  try {
    const reponse = await axios.get(`${BASE_URL}/wishlist/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return reponse.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
