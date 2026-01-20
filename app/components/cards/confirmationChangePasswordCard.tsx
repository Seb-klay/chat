"use client";

import { useActionState, useEffect } from "react";
import { updatePassword } from "./utils";
import { useFormStatus } from "react-dom";

type PropsCard = {
  error?: string | null;
  userEmail: string;
  setUpdatingEmail: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteError: React.Dispatch<React.SetStateAction<string | null>>;
};

export function ConfirmationUpdatePassword({
  error,
  userEmail,
  setUpdatingEmail,
  setDeleteError
}: PropsCard) {
  const [state, updatePasswordAction] = useActionState(
    updatePassword,
    undefined
  );

    useEffect(() => {
    if (state?.success) {
        setUpdatingEmail(false);
    }
    }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 text-gray-100 shadow-xl">
        {/* Header */}
        <h2 className="mb-2 text-lg font-semibold">Update Password</h2>
        <p className="mb-6 text-sm text-gray-400">
          Enter your current password and choose a new one.
        </p>

        {/* Form */}
        <form action={updatePasswordAction} className="space-y-5">

          {/* Hidden email */}
          <div>
            <input
              id="email"
              name="email"
              type="hidden"
              required
              value={userEmail}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100
                     placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-400 whitespace-pre-line">
                {state?.errors?.email?.join("\n")}
              </p>
            )}
          </div>

          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100
                     placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
            />
            {state?.errors?.currentPassword && (
              <p className="mt-1 text-sm text-red-400 whitespace-pre-line">
                {state?.errors?.currentPassword?.join("\n")}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100
                     placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 8 characters, with uppercase, lowercase, number and symbol
            </p>
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-400 whitespace-pre-line">
                {state?.errors?.password?.join("\n")}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100
                     placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-400 whitespace-pre-line">
                {state?.errors?.confirmPassword?.join("\n")}
              </p>
            )}
          </div>

          {/* Global error */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setUpdatingEmail(false);
                setDeleteError(null);
              }}
              className="rounded-lg bg-gray-700 px-4 py-2 hover:bg-gray-600 transition"
            >
              Cancel
            </button>

            <SubmitButton />
          </div>
        </form>
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
      className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700 transition"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      Update password
    </button>
  );
}
