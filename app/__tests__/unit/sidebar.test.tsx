import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Sidebar from "../../components/side-bar/appSidebar"; // Adjust path accordingly
import {
  getUserConversations,
  deleteConversation,
  updateTitleConversation,
} from "../../service";
import { redirect } from "next/navigation";

// Mock Next.js Navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: () => ({ id: "test-id-123" }),
  redirect: vi.fn(),
}));

// Mock API Services
vi.mock("../../service", () => ({
  getUserConversations: vi.fn(),
  deleteConversation: vi.fn(),
  updateTitleConversation: vi.fn(),
}));

// Intercept the server action file to avoid reaching session (with server only)
vi.mock("../../login/actions.ts", () => {
  return {
    logout: vi.fn(),
  };
});

// Mock Sub-components to isolate Sidebar logic
vi.mock("../../components/side-bar/ConversationsUser", () => ({
  default: ({ conversation, onOption }: any) => (
    <div data-testid="conv-item">
      {conversation.title}
      <button
        onClick={() =>
          onOption({ action: "delete", conversationId: conversation.convid })
        }
      >
        Delete Trigger
      </button>
      <button
        onClick={() =>
          onOption({ action: "rename", conversationId: conversation.convid })
        }
      >
        Rename Trigger
      </button>
    </div>
  ),
}));

vi.mock("../../components/cards/ConfirmationConvCard", () => ({
  ConfirmationConvCard: ({ onDelete, onCancel, onRename, onError }: any) => (
    <div data-testid="confirmation-card">
      {onError && <div role="alert">{onError}</div>}
      <button onClick={onDelete}>Confirm Delete</button>
      <button onClick={() => onRename("Updated Title")}>Confirm Rename</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe("Sidebar Component", () => {
  const mockConversations = [
    { convid: "1", title: "Test Chat 1", createdat: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getUserConversations as any).mockResolvedValue({
      json: async () => ({ conversations: mockConversations }),
    });
  });

  it("fetches and displays conversations on mount", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    await waitFor(() => {
      expect(getUserConversations).toHaveBeenCalled();
      expect(screen.getByText("Test Chat 1")).toBeInTheDocument();
    });
  });

  it("toggles collapse state when button is clicked", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    const toggleBtn = screen.getByLabelText(/Close sidebar/i);
    fireEvent.click(toggleBtn);

    // !isCollapsed && <h2>Conversations</h2>
    expect(screen.queryByText("Conversations")).not.toBeInTheDocument();
  });

  it("adds a new conversation when 'chat-created' event is dispatched", async () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    const newChat = {
      convid: "2",
      title: "Event Chat",
      createdat: new Date().toISOString(),
    };

    // Simulate custom event dispatch
    fireEvent(window, new CustomEvent("chat-created", { detail: newChat }));

    await waitFor(() => {
      expect(screen.getByText("Event Chat")).toBeInTheDocument();
    });
  });

  it("handles conversation deletion and redirects", async () => {
    (deleteConversation as any).mockResolvedValue({ ok: true });
    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    // Open confirmation (via the mocked ConversationsUser)
    await waitFor(() => screen.getByText("Test Chat 1"));
    fireEvent.click(screen.getByText("Delete Trigger"));

    // Click confirm in the card
    const confirmBtn = screen.getByText("Confirm Delete");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteConversation).toHaveBeenCalledWith("1");
      expect(redirect).toHaveBeenCalledWith("/");
    });
  });

  it("groups conversations by date correctly", async () => {
    const mixedConvs = [
      {
        convid: "1",
        title: "Today's Chat",
        createdat: new Date().toISOString(),
      },
      { convid: "2", title: "Old Chat", createdat: "2023-01-01T10:00:00Z" },
    ];
    (getUserConversations as any).mockResolvedValue({
      json: async () => ({ conversations: mixedConvs }),
    });

    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    await waitFor(() => {
      expect(screen.getByText("Last hour")).toBeInTheDocument();
      expect(screen.getByText("2023")).toBeInTheDocument();
    });
  });

  it("updates the conversation title locally and calls the API on rename", async () => {
    const mockData = [
      {
        convid: "1",
        title: "Test Chat 1",
        createdat: new Date().toISOString(),
      },
    ];

    (getUserConversations as any).mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: mockData }),
    });

    (updateTitleConversation as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    render(<Sidebar />);
    fireEvent.click(screen.getByTitle("Expand"));

    // wait for the title to display
    await waitFor(() => {
      expect(screen.getByText("Test Chat 1")).toBeInTheDocument();
    });

    // Open the rename confirmation card
    fireEvent.click(screen.getByText("Rename Trigger"));

    // Click the 'Confirm Rename' button in ConfirmationConvCard mock
    const renameConfirmBtn = screen.getByText("Confirm Rename");
    fireEvent.click(renameConfirmBtn);

    // Assertions
    await waitFor(() => {
      // Check if API was called with the correct ID and New Title
      expect(updateTitleConversation).toHaveBeenCalledWith(
        "1",
        "Updated Title",
      );

      // Check if the UI updated the title (replacing "Test Chat 1")
      expect(screen.getByText("Updated Title")).toBeInTheDocument();
      expect(screen.queryByText("Test Chat 1")).not.toBeInTheDocument();

      // Check if the confirmation card is removed (setConfirmationState(null))
      expect(screen.queryByTestId("confirmation-card")).not.toBeInTheDocument();
    });
  });
});
