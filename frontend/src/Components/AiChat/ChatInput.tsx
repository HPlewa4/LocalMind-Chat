import React from "react";
import { SendHorizontal } from "lucide-react";
import { ChatInputProps } from "../../types/AiChat";

const ChatInput: React.FC<ChatInputProps> = ({
  question,
  setQuestion,
  loading,
  askAI,
}) => {
   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !loading) {
        askAI();
      }
    }
  return (
    <div className="p-4 border-t border-gray-700 bg-gray-900">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder={loading ? "AI is thinking..." : "Type a message..."}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
        />
        <button
          onClick={askAI}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition flex items-center justify-center"
        >
          {loading ? "..." : <SendHorizontal size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
