import { useState } from "react";
import { IAnswer, IMessage } from '../utils/chatUtils';

export default function Input() {
  const decoder = new TextDecoder();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const sendMessage = async () => {
    const newMessages: IMessage[] = [
      ...messages,
      { role: "user", content: input, model:"tinyllama" },
    ];
    setMessages(newMessages);
    setInput("");

    // Create file with all api adresses
    const response: Response | null = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    switch (response.body) {
      default: {
        // when the reponse is done
        if (!response.body){
          return;
        }
        const reader = response.body.getReader();
        // Stream processing
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          // Decode the streamed chunks here
          const decodedMessage: string = decoder.decode(value);
          // Put it in the messages list
          setMessages((prev) => {
            const lastMessage = prev.at(-1);
            
            // If the last message is from assistant, append to it
            if (lastMessage?.role === "assistant") {
              const updatedMessage: IMessage = {
                ...lastMessage,
                content: lastMessage.content + decodedMessage,
              };
              return [...prev.slice(0, -1), updatedMessage];
            } 
            // Otherwise, create a new assistant message
            else {
              const newMessage: IMessage = {
                role: "assistant",
                content: decodedMessage,
                model: "tinyllama",
              };
              return [...prev, newMessage];
            }
          });
        }
      }
      case null: {
        throw console.error("error to correct later");
      }
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full h-full space-y-4">
        <div className="border rounded-lg p-4 overflow-y-auto bg-black">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div key={i} className="mb-2">
                <b>{m.role === "user" ? "You" : "Assistant"}:</b> {m.content}
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
