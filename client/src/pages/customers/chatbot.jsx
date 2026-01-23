import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { chatbotActions } from '../../features/customer/chatbotSlice';
import { getAnswer } from '../../features/customer/chatbotApi';

export default function ChatbotModal() {
  const dispatch = useDispatch();
  const { messages, inputValue, isOpen, isLoading } = useSelector(state => state.chatbot);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    dispatch(chatbotActions.addMessage(userMessage));
    dispatch(chatbotActions.setInputValue(''));
    dispatch(chatbotActions.setLoading(true));

    try {
      console.log("\n--- SENDING TO BACKEND ---");
      console.log("User Input:", inputValue);
      const response = await getAnswer(inputValue);
      
      console.log("Backend Response:", response);
      console.log("--- END ---\n");

      let botReply = "";
      
      if (response.error) {
        botReply = `Error: ${response.error}`;
        console.error("Bot Error:", response.error);
      } else {
        botReply = response.answer || "No answer received";
      }

      const botMessage = {
        id: messages.length + 2,
        text: botReply,
        sender: 'bot',
        timestamp: new Date()
      };
      
      dispatch(chatbotActions.addMessage(botMessage));
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      dispatch(chatbotActions.addMessage(errorMessage));
    } finally {
      dispatch(chatbotActions.setLoading(false));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => dispatch(chatbotActions.toggleChatbot())}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all z-40"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 flex items-end justify-end z-50 p-4 pointer-events-none">
      <div
        className="bg-white rounded-t-lg shadow-2xl flex flex-col w-full max-w-md h-[600px] animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h2 className="font-semibold">Chat Assistant</h2>
          </div>
          <button
            onClick={() => dispatch(chatbotActions.toggleChatbot())}
            className="hover:bg-blue-700 p-1 rounded transition-all cursor-pointer"
            title="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-gray-500 text-sm">Bot is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => dispatch(chatbotActions.setInputValue(e.target.value))}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}