"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./actions";

export function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Welcome Back</h1>
          <p className="text-gray-400">Please sign in to your account</p>
        </div>

        <form
          action={loginAction}
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
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors placeholder:text-gray-500"
              />
              {state?.errors?.password && (
                <p className="mt-2 text-sm text-red-400">
                  {state.errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-start">
              <a
                href="#"
                className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <SubmitButton />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                Create account
              </a>
            </p>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{" "}
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-gray-100 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        Login
    </button>
  );
}
