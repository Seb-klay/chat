import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React, { useActionState } from "react";
import { SignupForm } from "../../signup/signupForm";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

// Intercept the server action file to avoid reaching session (with server only)
vi.mock("../../signup/actions.ts", () => {
  return {
    signup: vi.fn(async (prevState, formData) => {
      return { success: false, errors: {} };
    }),
    verifyAndRegister: vi.fn(async (prevState, formData) => {
      return { success: false, errors: {} };
    }),
  };
});

// Mock Dispatchers
const mockSignupDispatch = vi.fn();
const mockVerifyDispatch = vi.fn();

interface ActionState {
  success?: boolean;
  errors?: Record<string, string[] | string>;
  temporaryData?: {
    email?: string;
    encrPassword?: string;
  };
}

describe("SignupForm Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: Show the signup form initially
    vi.mocked(useActionState).mockImplementation((action, initialState) => {
      const state = initialState as ActionState;
      if (state?.success) {
        return [state, mockVerifyDispatch, false];
      }
      return [state || {}, mockSignupDispatch, false];
    });
  });

  it("calls signup dispatch when the initial form is submitted correctly", async () => {
    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123!" },
    });

    // Check the terms checkbox
    fireEvent.click(screen.getByRole("checkbox"));

    const button = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignupDispatch).toHaveBeenCalled();
    });
  });

  it("transitions to verification view when signupState.success is true", () => {
    const successState = {
      success: true,
      temporaryData: {
        email: "test@example.com",
        encrPassword: "hashed_password",
      },
    };

    vi.mocked(useActionState)
      .mockReturnValueOnce([successState, mockSignupDispatch, false]) // Signup
      .mockReturnValueOnce([{}, mockVerifyDispatch, false]); // Verify

    render(<SignupForm />);

    // Check if the verification UI elements appear
    expect(screen.getByText(/we sent a 6-digit code to/i)).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    // Check for the 6 digit inputs
    const inputs = screen.getAllByRole("textbox");
    // Depending on your inputs, you might need to filter or find by pattern
    expect(inputs.length).toBeGreaterThanOrEqual(6);
  });

  it("displays validation errors from server action", () => {
    const errorState = {
      errors: {
        email: "Email already exists",
        password: "Password too weak",
      },
    };

    vi.mocked(useActionState).mockReturnValue([
      errorState,
      mockSignupDispatch,
      false,
    ]);

    render(<SignupForm />);

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
  });

  it("concatenates all 6 digits into the hidden combined-code input", async () => {
    const successState = {
      success: true,
      temporaryData: { email: "test@example.com" },
    };

    // Set mock to verification mode
    vi.mocked(useActionState).mockReturnValue([
      successState,
      mockVerifyDispatch,
      false,
    ]);

    const { container } = render(<SignupForm />);
    const hiddenInput = container.querySelector(
      "#combined-code",
    ) as HTMLInputElement;

    // Define the code we want to enter
    const testCode = "123456";

    // Loop through and fill each digit
    testCode.split("").forEach((char, index) => {
      const digitInput = container.querySelector(
        `input[name="digit-${index + 1}"]`,
      ) as HTMLInputElement;

      fireEvent.change(digitInput, { target: { value: char } });
    });

    // Verify the hidden input contains the full string
    expect(hiddenInput.value).toBe("123456");
  });

  it("submits the verification form with the full code", async () => {
    const successState = {
      success: true,
      temporaryData: { email: "test@example.com" },
    };
    vi.mocked(useActionState).mockReturnValue([
      successState,
      mockVerifyDispatch,
      false,
    ]);

    const { container } = render(<SignupForm />);

    // Fill the digits
    "987654".split("").forEach((char, i) => {
      fireEvent.change(
        container.querySelector(`input[name="digit-${i + 1}"]`)!,
        {
          target: { value: char },
        },
      );
    });

    // Submit the verification form
    const verifyButton = screen.getByRole("button", {
      name: /verify & create account/i,
    });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockVerifyDispatch).toHaveBeenCalled();
    });
  });
});
