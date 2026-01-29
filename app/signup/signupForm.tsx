"use client";

import { useActionState, useState, useEffect } from "react";
import { signup, verifyAndRegister } from "./actions";

export function SignupForm() {
  //const [state, signupAction] = useActionState(signup, undefined);
  const [signupState, signupAction] = useActionState(signup, null);
  const [verifyState, verifyAction] = useActionState(verifyAndRegister, null);
  const [verifying, setVerifying] = useState(false);
  const [temporaryData, setTemporaryData] = useState<any>(null);

  // Watch for successful signup
  useEffect(() => {
    if (signupState?.success && signupState?.temporaryData) {
      setTemporaryData(signupState.temporaryData);
      setVerifying(true);
    }
  }, [signupState]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Create Account</h1>
          <p className="text-gray-400">Join our community today</p>
        </div>

        {!verifying ? (
          <form
            action={signupAction}
            className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700"
          >
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
                />
                {signupState?.errors?.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {signupState.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
                />
                {signupState?.errors?.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {signupState.errors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password Field - Added for signup */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
                />
                {signupState?.errors?.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">
                    {signupState.errors.confirmPassword}
                  </p>
                )}
              </div>

              {signupState?.errors?.general && (
                <p className="mt-2 text-sm text-red-400">
                  {signupState.errors.general[0]}
                </p>
              )}

              {/* Terms Agreement - Added for signup */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-800"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-400"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-gray-100 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center justify-center gap-2.5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Create Account
                  <svg
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="/login" // Changed to login page
                  className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        ) : (
          // second part : verification code
          <div>
            <form action={verifyAction} className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold">{temporaryData?.email}</span>
                </p>
              </div>

              <div>
                <input
                  type="hidden"
                  name="email"
                  value={temporaryData?.email || ""}
                />
              </div>

              <div>
                <input
                  type="hidden"
                  name="encrPassword"
                  value={temporaryData?.encrPassword || ""}
                />
              </div>

              {/* 6-Digit Code Input */}
              <div>
                <label className="text-center block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      name={`digit-${i}`}
                      type="text"
                      maxLength={1}
                      pattern="[0-9]"
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      onChange={(e) => {
                        const code = Array.from(
                          { length: 6 },
                          (_, idx) =>
                            (
                              document.querySelector(
                                `input[name="digit-${idx + 1}"]`
                              ) as HTMLInputElement
                            )?.value || ""
                        ).join("");

                        // Update hidden input (for form submit)
                        const hiddenCode =
                          document.querySelector<HTMLInputElement>(
                            'input[name="code"]'
                          );
                        if (hiddenCode) hiddenCode.value = code;

                        setTemporaryData((prev: any) => ({
                          ...prev,
                          code,
                        }));

                        // Auto-focus next input
                        if (e.target.value && i < 6) {
                          document
                            .querySelector<HTMLInputElement>(
                              `input[name="digit-${i + 1}"]`
                            )
                            ?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {/* Hidden field that combines all digits */}
                <input type="hidden" name="code" id="combined-code" />
                {verifyState?.errors?.code && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    {verifyState.errors.code[0]}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-gray-100 font-semibold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Verify & Create Account
                </button>
              </div>
            </form>
            <form action={signupAction} className="text-center mt-3.5">
              <input type="hidden" name="email" value={temporaryData?.email} />
              <input type="hidden" name="password" value={temporaryData?.encrPassword} />
              <input type="hidden" name="confirmPassword" value={temporaryData?.encrPassword} />
              <button
                type="submit"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Click here to resend code
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
