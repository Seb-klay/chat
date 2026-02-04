import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatInput from "../../components/textInput/chatInput";

// Mock child components
vi.mock("../../components/buttons/sendButton", () => ({
  SendButton: ({ onClick, disabled }: any) => (
    <button
      data-testid="send-button"
      onClick={onClick}
      disabled={disabled}
    >
      Send
    </button>
  ),
}));

vi.mock("../../components/buttons/abortButton", () => ({
  AbortButton: ({ onClick }: any) => (
    <button data-testid="abort-button" onClick={onClick}>
      Abort
    </button>
  ),
}));

vi.mock("../../components/buttons/buttonAiModel", () => ({
  default: ({ onModelSelect }: any) => (
    <button
      data-testid="model-button"
      onClick={() =>
        onModelSelect({ id: 2, model_name: "gemma3:1b" })
      }
    >
      Choose Model
    </button>
  ),
}));

describe("ChatInput", () => {
  const onSendMock = vi.fn();
  const onAbortMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends message when Enter is pressed without Shift", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={false}
        onThought={false}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Type your message here..."
    );

    fireEvent.change(textarea, {
      target: { value: "Hello world" },
    });

    fireEvent.keyDown(textarea, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(onSendMock).toHaveBeenCalledWith(
      "Hello world",
      { id: 1, model_name: "llama3.2:3b" }
    );
    expect(textarea).toHaveValue("");
  });

  it("does NOT send message when Shift+Enter is pressed", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={false}
        onThought={false}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Type your message here..."
    );

    fireEvent.change(textarea, {
      target: { value: "Multiline text" },
    });

    fireEvent.keyDown(textarea, {
      key: "Enter",
      shiftKey: true,
    });

    expect(onSendMock).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Multiline text");
  });

  it("sends message when Send button is clicked", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={false}
        onThought={false}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Type your message here..."
    );
    const sendButton = screen.getByTestId("send-button");

    fireEvent.change(textarea, {
      target: { value: "Click send" },
    });

    fireEvent.click(sendButton);

    expect(onSendMock).toHaveBeenCalledWith(
      "Click send",
      { id: 1, model_name: "llama3.2:3b" }
    );
    expect(textarea).toHaveValue("");
  });

  it("disables Send button when input is empty", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={false}
        onThought={false}
      />
    );

    const sendButton = screen.getByTestId("send-button");
    expect(sendButton).toBeDisabled();
  });

  it("shows Abort button when chatbot is writing", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={true}
        onThought={false}
      />
    );

    expect(screen.getByTestId("abort-button")).toBeInTheDocument();
  });

  it("updates model when ChooseAiModel is used", () => {
    render(
      <ChatInput
        onSend={onSendMock}
        onAbort={onAbortMock}
        onChatbotWriting={false}
        onThought={false}
      />
    );

    fireEvent.click(screen.getByTestId("model-button"));

    const textarea = screen.getByPlaceholderText(
      "Type your message here..."
    );

    fireEvent.change(textarea, {
      target: { value: "Model test" },
    });

    fireEvent.keyDown(textarea, {
      key: "Enter",
    });

    expect(onSendMock).toHaveBeenCalledWith(
      "Model test",
      { id: 2, model_name: "gemma3:1b" }
    );
  });
});
