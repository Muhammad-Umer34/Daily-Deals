import axios from "axios";

// The stable production alias, not a one-off preview deployment URL (those go stale).
const BASE_URL = import.meta.env.VITE_CHATBOT_URL || "https://monofitchatbot.vercel.app";
const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");

export const getAnswer = async (question="what is your delivery charges?") => {
  console.log("Chatbot Function invoked with question:", question);
  console.log("Chatbot target URL:", `${cleanBaseUrl}/ask`);
  try {
    const response = await axios.post(`${cleanBaseUrl}/ask`, {
      query: question, 
    });
    console.log("Chatbot response received:", response);
    return response.data;
  } catch (error) {
    console.error("Error getting chatbot answer detailed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    return { error: "Something went wrong. Please try again later." };
  }
};
