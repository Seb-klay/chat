"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "./actions";

export function SignupForm() {
  const [state, signupAction] = useActionState(signup, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our community today</p>
        </div>

        <form
          action={signupAction} // Changed to signup action
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
                className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
              />
              {state?.errors?.email && (
                <p className="mt-2 text-sm text-red-400">
                  {state.errors.email}
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
                className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
              />
              {state?.errors?.password && (
                <p className="mt-2 text-sm text-red-400">
                  {state.errors.password}
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
                className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
              />
              {state?.errors?.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">
                  {state.errors.confirmPassword}
                </p>
              )}
            </div>

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
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
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
