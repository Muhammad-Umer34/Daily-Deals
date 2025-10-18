import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    { id: 1, text: "Hello! How can I help you today?", sender: 'bot', timestamp: new Date() }
  ],
  inputValue: '',
  isOpen: false,
  isLoading: false,
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setInputValue(state, action) {
      state.inputValue = action.payload;
    },
    toggleChatbot(state) {
      state.isOpen = !state.isOpen;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    clearMessages(state) {
      state.messages = [
        { id: 1, text: "Hello! How can I help you today?", sender: 'bot', timestamp: new Date() }
      ];
    },
    removeMessage(state, action) {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    openChatbot(state) {
      state.isOpen = true;
    },
    closeChatbot(state) {
      state.isOpen = false;
    },
  }
});

export const chatbotActions = chatbotSlice.actions;
export default chatbotSlice;