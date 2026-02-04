import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import HomePage from "../../homePage/page";
import { createConversation } from "../../service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock Next.js Router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the API call
vi.mock("../../service", () => ({
  createConversation: vi.fn(),
}));

vi.mock("../../components/textInput/chatinput", () => ({
  default: ({ onSend }: any) => (
    <div>
      {/* We give this button a specific test ID to find it easily */}
      <button
        data-testid="send-button"
        onClick={() => onSend("Test Message", { id: 1, model_name: "llama3.2:3b" })}
      >
        Send
      </button>
    </div>
  ),
}));

vi.mock("sonner", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    toast: {
      warning: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});


describe("HomePage", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: pushMock });
  });

  it("triggers createConversation and redirects on success", async () => {
    // Setup mock response for the API utility
    (createConversation as any).mockResolvedValue({
      ok: true,
      json: async () => [{ convid: "new-123" }],
    });

    render(<HomePage />);

    // Trigger the "onSend" prop via mocked component
    const sendButton = screen.getByTestId("send-button");
    fireEvent.click(sendButton);

    // Assertions: Did the HomePage logic run?
    await waitFor(() => {
      expect(createConversation).toHaveBeenCalledWith(
        "Test Message",
        { id: 1, model_name: "llama3.2:3b" },
      );
      expect(pushMock).toHaveBeenCalledWith("/conversation/new-123");
    });
  });

  it("shows a toast warning if the API response is not ok", async () => {
    (createConversation as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<HomePage />);
    fireEvent.click(screen.getByTestId("send-button"));

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(
        expect.stringContaining("500"),
      );
    });
  });
});
