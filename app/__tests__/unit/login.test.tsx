import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { LoginForm, SubmitButton } from "../../login/loginForm";
import * as ReactDOMModule from "react-dom";
import { useActionState } from "react";

// Mock the Server Action
const mockDispatch = vi.fn();

vi.mock("react", async () => {
  // Import React module
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    // Properly type and implement the hook mock
    useActionState: vi.fn((action, initialState) => {
      // Returns [state, dispatch, isPending]
      return [initialState, mockDispatch, false];
    }),
  };
});

// Mock useFormStatus from react-dom
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

// Intercept the server action file to avoid reaching session (with server only)
vi.mock("../../login/actions.ts", () => {
  return {
    login: vi.fn(async (prevState, formData) => {
      // Return a mock successful response or error state
      return { errors: {} };
    }),
  };
});

describe("LoginForm with Zod Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("calls dispatch when the form is submitted correctly", async () => {
    // Mocking the hook to return: [state, dispatch, isPending]
    vi.spyOn(React, "useActionState").mockReturnValue([
      {},
      mockDispatch,
      false,
    ]);

    render(<LoginForm />);

    // Fill fields using the labels
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "123456789Aa@" },
    });

    // Target the SubmitButton specifically by its role and text
    const button = screen.getByRole("button", { name: /login/i });
    fireEvent.click(button);

    // Wait for the mocked dispatch to be triggered by the form action
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  it("SubmitButton is disabled when pending is true", () => {
    vi.spyOn(ReactDOMModule, "useFormStatus").mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/login",
    });

    render(<SubmitButton />);
    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeDisabled();
  });

  it("SubmitButton is enabled when pending is false", () => {
    vi.spyOn(ReactDOMModule, "useFormStatus").mockReturnValue({
      pending: false,
      data: null,
      method: null,
      action: null,
    });

    render(<SubmitButton />);
    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeEnabled();
  });

  it("SubmitButton inside LoginForm respects pending state", () => {
    vi.spyOn(ReactDOMModule, "useFormStatus").mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "POST",
      action: "/login",
    });

    render(<LoginForm />);
    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeDisabled();
  });

  it("displays Zod validation errors", () => {
    const errorState = {
      errors: {
        email: ["Invalid email address"],
        password: ["Password must be at least 8 characters"],
      },
    };

    // Tell the mocked function exactly what to return
    vi.mocked(useActionState).mockReturnValue([errorState, vi.fn(), false]);

    render(<LoginForm />);

    // matcher
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });
});
