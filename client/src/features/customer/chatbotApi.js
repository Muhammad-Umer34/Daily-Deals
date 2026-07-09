import axios from "axios";

const BASE_URL = import.meta.env.VITE_CHATBOT_URL || "https://monofitchatbot-b0wosey85-muhammad-umer34s-projects.vercel.app";
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
