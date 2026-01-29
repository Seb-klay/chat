"use client";

import { useActionState, useEffect } from "react";
import { updatePassword } from "./utils";
import { useFormStatus } from "react-dom";
import { useTheme } from "../contexts/theme-provider";
import { CancelButton } from "../buttons/cancelButton";
import { UpdateButton } from "../buttons/updateButton";

type PropsCard = {
  userEmail: string;
  cancelUpdate: () => void;
  onError?: string | null;
};

export function ConfirmationUpdatePassword({
  userEmail,
  cancelUpdate,
  onError,
}: PropsCard) {
  const [state, updatePasswordAction] = useActionState(
    updatePassword,
    undefined
  );
  const { theme } = useTheme();

    useEffect(() => {
    if (state?.success) {
        cancelUpdate;
    }
    }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div style={{ backgroundColor: theme.colors.background, color: theme.colors.primary}} className="w-full max-w-md rounded-xl bg-gray-800 p-6 text-gray-100 shadow-xl">
        {/* Header */}
        <h2 className="mb-2 text-lg font-semibold">Update Password</h2>
        <p style={{ color: theme.colors.secondary}} className="mb-6 text-sm">
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
              className="w-full rounded-lg border border-gray-700 px-4 py-3
                     placeholder:text-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
              style={{ backgroundColor: theme.colors.tertiary_background, color: theme.colors.primary }}
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
              className="mb-2 block text-sm font-medium"
              style={{ color: theme.colors.secondary }}
            >
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="w-full rounded-lg border border-gray-700 px-4 py-3
                     focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
              style={{ backgroundColor: theme.colors.tertiary_background, color: theme.colors.primary }}
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
              className="mb-2 block text-sm font-medium"
              style={{ color: theme.colors.secondary }}
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-700 px-4 py-3
                     focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
              style={{ backgroundColor: theme.colors.tertiary_background, color: theme.colors.primary }}
            />
            <p style={{ color: theme.colors.secondary }} className="mt-1 text-xs">
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
              className="mb-2 block text-sm font-medium"
              style={{ color: theme.colors.secondary }}
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-700 px-4 py-3
                     focus:border-blue-600 focus:ring-2 focus:ring-blue-600
                     outline-none transition"
              style={{ backgroundColor: theme.colors.tertiary_background, color: theme.colors.primary }}
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-sm text-red-400 whitespace-pre-line">
                {state?.errors?.confirmPassword?.join("\n")}
              </p>
            )}
          </div>

          {/* Global error */}
          {onError && <p className="text-sm text-red-400">{onError}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <CancelButton
              onCancel={cancelUpdate} />

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
    <UpdateButton
      onUpdate={() => {}}
      buttonName="Update Password"
      isPending={pending}
      buttonType="submit" />
  );
}
