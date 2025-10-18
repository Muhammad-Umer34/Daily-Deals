import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const getAnswer = async (question="what is your delivery charges?") => {
  console.log("In Function");
  try {
    const response = await axios.post(`${BASE_URL}/ask`, {
      query: question, 
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error getting chatbot answer:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};
