import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConversation, storeMessage } from "../service";
import { IMessage, IModelList, IPayload } from "../utils/chatUtils";

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<IModelList>({
    model_name: "llama3.2:3b",
    address: "http://localhost:11435",
  });

  const createAndRedirect = async () => {
    if (!input.trim()) return;

    setLoading(true);

    // Set empty list of message
    const newMessages: IMessage[] = [
      { role: "user", model: selectedModel.model_name, prompt: input },
    ];

    try {
      // Create new conversation
      const response = await createConversation();

      if (!response?.ok) {
        throw new Error(
          `Error with status ${response?.status} while creating a conversation. Try again please.`
        );
      }

      const data = await response?.json();
      const conversationId = data.rows[0].convid;

      // create payload to send prompt to AI
      const payload: IPayload = {
        model: selectedModel.model_name,
        address: selectedModel.address,
        prompt: newMessages,
        isStream: true,
        conversationID: conversationId,
      };

      // Store message in new conversation
      storeMessage(payload);

      // Redirect to the new conversation
      router.push(`/conversation/${conversationId}`);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
            <h1 className="text-2xl font-bold text-white mb-2">
              New Conversation
            </h1>
            <p className="text-gray-400 text-sm">Start a chat with AI</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-4 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
            />

            <button
              onClick={createAndRedirect}
              disabled={loading || !input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Chat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
