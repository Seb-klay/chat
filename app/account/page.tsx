"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteUserAccount,
  getAccountDetails,
  updatePasswordUser,
} from "../service";
import { ConfirmationCardDeleteUser } from "../components/cards/confirmationDeleteUserCard";
import { ConfirmationUpdatePassword } from "../components/cards/confirmationChangePasswordCard";

export default function Account() {
  const [updatingEmail, setUpdatingEmail] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("test@test.com");
  const [deletingUserAccount, setDeletingUserAccount] =
    useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getAccountDetails();
      const data = await response?.json();
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUserAccount = async () => {
    if (deletingUserAccount) {
      console.log(1);
      // call API to delete the conversation
      const response = await deleteUserAccount();

      if (!response?.ok) {
        setDeleteError("The user could not be deleted.");
      } else {
        setDeletingUserAccount(false);
        router.push(`/signup`);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] px-2">
      <div className="flex-1 overflow-y-auto">
        <div className="rounded-xl border bg-transparent p-6 m-6 space-y-4 w-full md:w-1/2 mx-auto">
          <h2 className="text-lg font-semibold">Account Details</h2>

          {/* Email Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">user@example.com</p>
            </div>
            <button
              onClick={() => setDeletingUserAccount(true)}
              className="px-4 py-2 bg-red-400 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>

          {/* Delete confirmation card */}
          {deletingUserAccount && (
            <ConfirmationCardDeleteUser
              error={deleteError}
              setDeletingUserAccount={setDeletingUserAccount}
              setDeleteError={setDeleteError}
              handleDelete={handleDeleteUserAccount}
            />
          )}

          {/* Password Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Password</p>
              <p className="font-medium">••••••••</p>
            </div>
            <button
              onClick={() => setUpdatingEmail(true)}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-900"
            >
              Update
            </button>
          </div>

          {/* Update confirmation card */}
          {updatingEmail && (
            <ConfirmationUpdatePassword
              error={deleteError}
              userEmail={email}
              setUpdatingEmail={setUpdatingEmail}
              setDeleteError={setDeleteError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
