import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ConversationPage from "../../(main)/conversation/[id]/page";
import { getConversationHistory, getSingleConversations } from "../../service";
import {
  IMessage,
  IPayload,
  summaryConversationAndUpdate,
} from "@/app/utils/chatUtils";
import { sendChatMessage } from "@/app/service/aiService";
import { toast } from "sonner";
import React from "react";

// Mock the services
vi.mock("../../service", () => ({
  getConversationHistory: vi.fn(),
  getSingleConversations: vi.fn(),
}));

vi.mock("../../utils/chatUtils", () => ({
  summaryConversationAndUpdate: vi.fn(),
}));

vi.mock("../../service/aiService", () => ({
  sendChatMessage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => <div data-testid="mock-toaster" />,
}));

// mock chat input
vi.mock("../../components/textInput/chatInput", () => ({
  default: ({ onSend }: any) => (
    <div>
      {/* We give this button a specific test ID to find it easily */}
      <button
        data-testid="send-button"
        onClick={() =>
          onSend("Test Message", { id: 1, model_name: "llama3.2:3b" })
        }
      >
        Send
      </button>
    </div>
  ),
}));

// mock dialog component
vi.mock("../../components/dialogs/dialogs", () => ({
  default: ({ messages }: { messages: IMessage[] }) => (
    <div data-testid="mock-dialog">
      {messages.map((m, i) => (
        <div key={i} data-testid={`message-${m.role}`}>
          {m.content}
        </div>
      ))}
    </div>
  ),
}));

// Mock Next Navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "test-id-123" }),
}));

// scroll to bottom mock
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockHistory = [
  {
    role: "user",
    content: "Hello",
    model: { id: 1, model_name: "llama3.2:3b" },
  },
  {
    role: "assistant",
    content: "Hi there!",
    model: { id: 1, model_name: "llama3.2:3b" },
  },
];

describe("Loading history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays message history when messages exist", async () => {
    (getConversationHistory as any).mockResolvedValue({
      ok: true,
      json: async () => mockHistory,
    });

    render(<ConversationPage />);

    await waitFor(() => {
      // Check if messages are rendered in the UI
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });
  });

  it("handles new conversations (empty history) by fetching metadata and summarizing", async () => {
    // Return empty history
    (getConversationHistory as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    // Return conversation metadata
    (getSingleConversations as any).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          title: "New Chat",
          defaultmodel: { id: 1, model_name: "llama3.2:3b" },
        },
      ],
    });

    render(<ConversationPage />);

    await waitFor(() => {
      // Verify metadata was fetched
      expect(getSingleConversations).toHaveBeenCalledWith("test-id-123");
      // Verify summary was triggered
      expect(summaryConversationAndUpdate).toHaveBeenCalled();
    });
  });

  it("shows a toast warning if the history fetch fails", async () => {
    (getConversationHistory as any).mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<ConversationPage />);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining("404"),
      );
    });
  });

  it("catches and toasts unexpected errors", async () => {
    (getConversationHistory as any).mockRejectedValue(
      new Error("Network Failure"),
    );

    render(<ConversationPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error: Network Failure");
    });
  });
});

describe("Sending message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Setup metadata mock (fixes the skeleton issue)
  (getSingleConversations as any).mockResolvedValue({
    ok: true,
    json: async () => [{ title: "Test Title", defaultmodel: "llama3-2:3b" }],
  });

  // Provide the conversation metadata
  (getSingleConversations as any).mockResolvedValue({
    ok: true,
    json: async () => [
      { title: "New Chat", defaultmodel: { id: 1, model_name: "llama3.2:3b" } },
    ],
  });

  it("sends the correct payload to the AI service", async () => {
    render(<ConversationPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    });

    const sendButton = screen.getByTestId("send-button");
    fireEvent.click(sendButton);

    // Assert on the service call instead of the UI text
    await waitFor(() => {
      expect(sendChatMessage).toHaveBeenCalledWith(
        // The Payload
        expect.objectContaining({
          conversationID: "test-id-123", // Matches your useParams mock
          isStream: true,
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: "Test Message",
              role: "user",
              model: expect.objectContaining({
                model_name: "llama3.2:3b",
              }),
            }),
          ]),
        }),
        // controller
        expect.any(AbortController),
        // callbacks
        expect.objectContaining({
          onData: expect.any(Function),
          onError: expect.any(Function),
          onWrite: expect.any(Function),
          onCompleted: expect.any(Function),
        }),
      );
    });
  });

  it("shows a toast warning when onError is triggered during streaming", async () => {
    (sendChatMessage as any).mockImplementation(
      async (
        payload: IPayload,
        controller: AbortController,
        callbacks: {
          onData: (chunk: string) => void;
          onError: (err: any) => void;
          onWrite: () => void;
          onCompleted: () => void;
        },
      ) => {
        callbacks.onError(new Error("Stream Interrupted"));
      },
    );

    render(<ConversationPage />);
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith("Error: Stream Interrupted");
    });
  });

  it("catches errors if the sendChatMessage utility throws", async () => {
    (sendChatMessage as any).mockRejectedValue(new Error("Network Crash"));

    render(<ConversationPage />);
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error: Network Crash");
    });
  });
});

describe("Displaying messages with Dialogs component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (getConversationHistory as any).mockResolvedValue({
      ok: true,
      json: async () => mockHistory,
    });

    // Setup metadata mock so skeleton does not appear
    (getSingleConversations as any).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          title: "New Chat",
          defaultmodel: { id: 1, model_name: "llama3.2:3b" },
        },
      ],
    });
  });

  it("renders a list of messages inside Dialog", async () => {
    // Render the ConversationPage with a test-only prop to inject messages
    render(<ConversationPage />);

    // Assert that the Dialog renders all messages
    const dialog = await screen.findByTestId("mock-dialog");
    expect(dialog).toBeInTheDocument();

    // Assert that each message from the mock history is rendered
    await waitFor(() => {
      expect(screen.getByTestId("message-user")).toHaveTextContent("Hello");
      expect(screen.getByTestId("message-assistant")).toHaveTextContent(
        "Hi there!",
      );
    });
  });
});
