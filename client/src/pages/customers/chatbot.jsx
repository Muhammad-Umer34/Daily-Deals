import { useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { chatbotActions } from '../../features/customer/chatbotSlice';
import { getAnswer } from '../../features/customer/chatbotApi';

export default function ChatbotModal() {
  const dispatch = useDispatch();
  const { messages, inputValue, isOpen, isLoading } = useSelector(state => state.chatbot);
  const { pathname } = useLocation();
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
      const response = await getAnswer(inputValue);
      // Server errors stay in the console; shoppers get a plain apology.
      if (response.error) console.error("Bot Error:", response.error);
      const botReply = response.error || !response.answer
        ? "Sorry, I'm having trouble answering right now. Please try again in a moment."
        : response.answer;

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

  // The Shop Assistant is already a chat, and the home page offers it twice; a floating
  // button there would cover the send box or the hero's primary action.
  if (pathname.startsWith('/assistant') || pathname === '/home' || pathname === '/') return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => dispatch(chatbotActions.toggleChatbot())}
        aria-label="Open chat assistant"
        className="fixed bottom-5 right-5 bg-ink hover:opacity-80 text-paper rounded-full p-3.5 transition-all z-40 cursor-pointer"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 flex items-end justify-end z-50 p-4 pointer-events-none">
      <div
        className="bg-paper rounded-t-lg shadow-2xl flex flex-col w-full max-w-md h-[600px] animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-ink text-paper p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h2 className="font-semibold">Chat Assistant</h2>
          </div>
          <button
            onClick={() => dispatch(chatbotActions.toggleChatbot())}
            className="hover:opacity-80 p-1 rounded transition-all cursor-pointer"
            title="Close chat"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-parchment">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
 msg.sender === 'user'
 ? 'bg-ink text-paper rounded-br-none'
 : 'bg-hairline text-ink rounded-bl-none'
 }`}
              >
                <p className="text-sm whitespace-pre-line">
                  {/* Bot answers use **bold**; render it instead of showing the asterisks. */}
                  {msg.text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
                </p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-bark text-sm">Bot is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-hairline p-3 bg-paper rounded-b-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => dispatch(chatbotActions.setInputValue(e.target.value))}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-hairline rounded-lg px-3 py-2 focus:outline-none focus:border-ink text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-ink hover:opacity-80 disabled:opacity-50 text-paper rounded-lg p-2 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}