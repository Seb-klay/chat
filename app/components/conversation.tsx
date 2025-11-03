import { useState } from "react";
import { IMessage, IPayload, handleStreamResponse, IModelList } from '../utils/chatUtils';
import { postMessage } from '../service/index';
import ChooseAiModel from '../components/buttons/buttonAiModel';

export default function Input() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<IModelList>({
    model_name: "tinyllama",
    address: "http://localhost:11434",
});

  const sendMessage = async () => {
    const newMessages: IMessage[] = [
      ...messages,
      { role: "user", model: selectedModel.model_name, prompt: input },
    ];
    setMessages(newMessages);
    setInput("");

    const payload:IPayload = {
      model: selectedModel.model_name,
      address: selectedModel.address,
      prompt: newMessages,
      isStream:true
    }

    // TODO : Create file with all api adresses
    const response: Response | null = await postMessage(payload);

    // update the setMessages useState to show messages
    handleStreamResponse (response, setMessages);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full h-full min-h-1/2 space-y-4">
        <div className="border rounded-lg p-4 overflow-y-auto bg-black">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div key={i} className="mb-2">
                <b>{m.role === "user" ? "You" : "Assistant"}:</b> {m.prompt}
              </div>
            ))}
        </div>
        <div className="flex space-x-2">
          {/* input keyboard user */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg p-2"
            placeholder="Type your message..."
          />
          {/* send button */}
          <ChooseAiModel model={selectedModel} setModel={setSelectedModel}></ChooseAiModel>
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
