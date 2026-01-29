import { CancelButton } from "../buttons/cancelButton";
import { DeleteButton } from "../buttons/deleteButton";
import { useTheme } from "../contexts/theme-provider";

type PropsCard = {
  cancelDelete: () => void;
  handleDelete: () => void;
  onError?: string | null;
};

export function ConfirmationCardDeleteUser({
  cancelDelete,
  handleDelete,
  onError,
}: PropsCard) {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div style={{ backgroundColor: theme.colors.background, color: theme.colors.primary}} className="p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Delete Account ?</h2>
        <p className="mb-6">Are you sure you want to delete this account ?</p>
        {onError && <p className="mb-6 text-red-400">{onError}</p>}
        <div className="flex justify-end gap-4">
          <CancelButton
            onCancel={cancelDelete} />
          <DeleteButton
          onDelete={handleDelete}
          buttonName="Delete" />
        </div>
      </div>
    </div>
  );
}
