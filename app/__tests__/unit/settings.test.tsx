import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Settings from "../../(main)/settings/page";
import * as modelHooks from "../../components/contexts/model-provider"; 
import * as themeHooks from "../../components/contexts/theme-provider";

describe("SettingsPage Component", () => {
const mockUpdateModel = vi.fn();
  const mockModels = [
    { id: 1, model_name: "llama3.2:3b" },
    { id: 2, model_name: "gemma3:1b" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock useModel return value
    vi.spyOn(modelHooks, "useModel").mockReturnValue({
      selectedModel: mockModels[0],
      allModels: mockModels,
      updateModel: mockUpdateModel,
      setSelectedModel: vi.fn(),
      isLoading: false,
    });

    // Mock useTheme return value (to prevent 'undefined' errors on theme.colors)
    vi.spyOn(themeHooks, "useTheme").mockReturnValue({
      theme: {
        colors: {
          background: "#000",
          primary: "#fff",
          secondary: "#ccc",
          background_second: "#111",
          tertiary_background: "#222",
        }
      },
      mode: "dark",
      toggleTheme: vi.fn(),
    });
  });

  it("renders the list of all available models", () => {
    render(<Settings />);
    
    const llamaElements = screen.getAllByText("llama3.2");
    expect(llamaElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("gemma3")).toBeInTheDocument();
    expect(screen.getByText("Active Models: 2")).toBeInTheDocument();
  });

  it("shows 'Selected' for the active model and 'Select' for others", () => {
    render(<Settings />);
    
    const buttons = screen.getAllByRole("button");
    const selectedBtn = buttons.find(btn => btn.textContent === "Selected");
    const selectBtn = buttons.find(btn => btn.textContent === "Select");

    expect(selectedBtn).toBeInTheDocument();
    expect(selectBtn).toBeInTheDocument();
  });

  it("updates the model and shows a toast when a new model is selected", async () => {
    render(<Settings />);

    // Find the 'Select' button for the second model
    const selectBtn = screen.getByRole("button", { name: "Select" });
    
    fireEvent.click(selectBtn);

    // Verify logic was called
    expect(mockUpdateModel).toHaveBeenCalledWith(mockModels[1]);

    // Verify Toast UI appears
    expect(screen.getByText("Switched to gemma3:1b")).toBeInTheDocument();

    // Verify Toast disappears after 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.queryByText("Switched to gemma3:1b")).not.toBeInTheDocument();
  });

  it("calls toggleTheme when the theme switch is clicked", () => {
    const mockToggleTheme = vi.fn();

    // Update mock for this specific test
    vi.spyOn(themeHooks, "useTheme").mockReturnValue({
        theme: { colors:           
          {background: "#000",
          primary: "#fff",
          secondary: "#ccc",
          background_second: "#111",
          tertiary_background: "#222"} },
        mode: "dark", 
        toggleTheme: mockToggleTheme,
    });
    render(<Settings />);

    const checkbox = screen.getByRole("checkbox", { hidden: true });

    fireEvent.click(checkbox);

    // Check if toggleTheme was called
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it("displays the correct current selection info in the right column", () => {
    render(<Settings />);
    
    const currentSection = screen.getByText("Current Selection").closest("div");
    expect(currentSection).toHaveTextContent("llama3.2");
    expect(currentSection).toHaveTextContent("Parameters: 3b");
  });
});