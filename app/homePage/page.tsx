import ChatInput from "../components/textInput/chatInput";

export default function HomePage() {

return(
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    {/* Header with icon and text */}
    <div className="mb-8 text-center">
      {/* Icon */}
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      
      {/* Text */}
      <h2 className="text-2xl font-bold text-white mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-400">
        Start a conversation with our AI assistant
      </p>
    </div>
    
    <ChatInput></ChatInput>
  </div>
);
}
