import { useRouter } from 'next/navigation'
import ChatInput from "../components/textInput/chatInput";
import { createConversation, storeMessage } from "../service";
import { IPayload, IMessage } from "../utils/chatUtils";
import { IModelList } from "../utils/listModels";

export default function HomePage() {
  const router = useRouter();

  const postMessageToDB = async (payload: IPayload) => {
    const response = await storeMessage(payload);

    if (!response?.ok) {
      throw new Error("Could not save the message. Try again please.");
    }
    return response;
  };

  const createAndRedirect = async (userInput: string, selectedModel: IModelList) => {
    if (!userInput.trim()) return;

    //setIsSending(true);
    //setLoading(true);

    // Set empty list of message
    const newMessages: IMessage[] = [
      { role: "user", model: selectedModel, prompt: userInput },
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
        messages: newMessages,
        isStream: true,
        conversationID: conversationId,
      };

      // Store message in new conversation
      const responseDB = await postMessageToDB(payload);

      if (!responseDB.ok) {
        throw new Error("Could not store user message. Try again please.");
      }

      // Redirect to the new conversation
      router.push(`/conversation/${conversationId}`);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      //setIsSending(false);
      //setLoading(false);
    }
  };

  return (
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

      <ChatInput onSend={createAndRedirect} />
    </div>
  );
}
