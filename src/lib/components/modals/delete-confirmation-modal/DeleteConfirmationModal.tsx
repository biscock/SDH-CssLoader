import { useCSSLoaderActions } from "@/backend";
import { ConfirmModal } from "../../../primitives";

export function DeleteConfirmationModal({
  closeModal,
  themeIdsToBeDeleted,
  onDeleteFinish,
  type = "theme",
}: {
  closeModal?: () => void;
  themeIdsToBeDeleted: string[];
  onDeleteFinish?: () => void;
  type?: "theme" | "profile";
}) {
  const { deleteTheme } = useCSSLoaderActions();
  async function deleteThemes() {
    for (let i = 0; i < themeIdsToBeDeleted.length; i++) {
      await deleteTheme(themeIdsToBeDeleted[i], i === themeIdsToBeDeleted.length - 1);
    }
    onDeleteFinish?.();
    closeModal?.();
  }

  return (
    <ConfirmModal
      title={`Delete ${type.charAt(0).toUpperCase() + type.slice(1)}s`}
      onConfirm={deleteThemes}
      closeModal={closeModal}
    >
      <div>
        Are you sure you want to delete{" "}
        {themeIdsToBeDeleted.length === 1
          ? `this ${type}`
          : `these ${themeIdsToBeDeleted.length} ${type}s`}
        ?
      </div>
    </ConfirmModal>
  );
}
