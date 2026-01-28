"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAccount } from "../service";
import { ConfirmationCardDeleteUser } from "../components/cards/confirmationDeleteUserCard";
import { ConfirmationUpdatePassword } from "../components/cards/confirmationChangePasswordCard";
import {
  UserCircleIcon,
  EnvelopeIcon,
  TrashIcon,
  LockClosedIcon,
  KeyIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { DeleteButton } from "../components/buttons/deleteButton";
import { UpdateButton } from "../components/buttons/updateButton";

export default function Accountdetails() {
  const [deletingUserAccount, setDeletingUserAccount] =
    useState<boolean>(false);
  const [updatingEmail, setUpdatingEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("test@test.com");
  const router = useRouter();

  const handleDeleteUserAccount = async () => {
    if (deletingUserAccount) {
      // call API to delete the conversation
      const response = await deleteUserAccount();
      if (!response?.ok) {
        setError("The user could not be deleted.");
      } else {
        setDeletingUserAccount(false);
        router.push(`/signup`);
      }
    }
  };

  const cancelEvent = () => {};

  return (
    <div className="rounded-2xl p-6 bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6 text-blue-400" />
          Account Details
        </h2>
        <span className="text-xs bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full">
          Secure Account
        </span>
      </div>

      {/* Email Section */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-transparent transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="font-medium">user@example.com</p>
              </div>
            </div>

            <DeleteButton
              onDelete={() => setDeletingUserAccount(true)}
              buttonName="Delete Account"
            />
          </div>
        </div>

        {/* Delete confirmation card */}
        {deletingUserAccount && (
          <div className="mt-4">
            <ConfirmationCardDeleteUser
              cancelDelete={() => {
                (setDeletingUserAccount(false), setError(null));
              }}
              handleDelete={handleDeleteUserAccount}
              onError={error}
            />
          </div>
        )}

        {/* Password Section */}
        <div className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-transparent transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800">
                <LockClosedIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Password</p>
                <p className="font-medium">••••••••</p>
              </div>
            </div>

            <UpdateButton
              onUpdate={() => setUpdatingEmail(true)}
              buttonName="Update Password"
            />
          </div>
        </div>

        {/* Update confirmation card */}
        {updatingEmail && (
          <div className="mt-4">
            <ConfirmationUpdatePassword
              userEmail={email}
              cancelUpdate={() => {
                (setUpdatingEmail(false), setError(null));
              }}
              onError={error}
            />
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <div className="flex items-start gap-3 text-sm text-gray-400">
            <InformationCircleIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p>
              Account changes are permanent. Make sure you have backup access
              before deleting your account. Account settings are secured with end-to-end
              encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
