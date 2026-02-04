import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AccountDetails from "../../account/accountDetails";
import { getEmail, deleteUserAccount } from "../../service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock External Hooks & Services
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../service", () => ({
  getEmail: vi.fn(),
  deleteUserAccount: vi.fn(),
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

// Mock Sub-components (to isolate the logic)
vi.mock("../../components/buttons/deleteButton", () => ({
  DeleteButton: ({ onDelete }: any) => (
    <button onClick={onDelete} data-testid="delete-btn">
      Delete Account
    </button>
  ),
}));

vi.mock("../../components/cards/confirmationDeleteUserCard", () => ({
  ConfirmationCardDeleteUser: ({
    handleDelete,
    cancelDelete,
    onError,
  }: any) => (
    <div data-testid="delete-confirmation">
      {onError && <p>{onError}</p>}
      <button onClick={handleDelete} data-testid="confirm-delete">
        Confirm
      </button>
      <button onClick={cancelDelete} data-testid="cancel-delete">
        Cancel
      </button>
    </div>
  ),
}));

describe("AccountDetails Component", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: pushMock });
  });

  it("fetches and displays the user email on mount", async () => {
    (getEmail as any).mockResolvedValue({
      ok: true,
      json: async () => [{ email: "test@example.com" }],
    });

    await act(async () => {
      render(<AccountDetails />);
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("shows a toast warning if email fetch fails", async () => {
    (getEmail as any).mockResolvedValue({ ok: false });

    await act(async () => {
      render(<AccountDetails />);
    });

    expect(toast.warning).toHaveBeenCalledWith("No email could be found.");
  });

  it("handles the account deletion flow successfully", async () => {
    // Initial Load
    (getEmail as any).mockResolvedValue({
      ok: true,
      json: async () => [{ email: "user@test.com" }],
    });

    // Mock successful delete
    (deleteUserAccount as any).mockResolvedValue({ ok: true });

    render(<AccountDetails />);

    // Click delete to show confirmation card
    fireEvent.click(screen.getByTestId("delete-btn"));

    // Check if confirmation card appeared
    expect(screen.getByTestId("delete-confirmation")).toBeInTheDocument();

    // Click confirm
    fireEvent.click(screen.getByTestId("confirm-delete"));

    await waitFor(() => {
      expect(deleteUserAccount).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/signup");
    });
  });

  it("displays an error message if account deletion fails", async () => {
    (getEmail as any).mockResolvedValue({
      ok: true,
      json: async () => [{ email: "user@test.com" }],
    });

    // Mock failed delete
    (deleteUserAccount as any).mockResolvedValue({ ok: false });

    render(<AccountDetails />);

    // Open card and confirm
    fireEvent.click(screen.getByTestId("delete-btn"));
    fireEvent.click(screen.getByTestId("confirm-delete"));

    await waitFor(() => {
      expect(
        screen.getByText("The user could not be deleted."),
      ).toBeInTheDocument();
    });
  });

  it("opens the password update card when clicking update", async () => {
    await act(async () => {
      render(<AccountDetails />);
    });

    const updateBtn = screen.getByText("Update Password");
    fireEvent.click(updateBtn);

    expect(
      screen.getByText(/Account settings are secured/i),
    ).toBeInTheDocument();
  });
});
