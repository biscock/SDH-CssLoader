import { useCSSLoaderAction } from "@/backend";
import { ConfirmModal } from "../../../primitives";

export function DeleteConfirmationModal({
  closeModal,
  themesToBeDeleted,
  onDeleteFinish,
}: {
  closeModal?: () => void;
  themesToBeDeleted: string[];
  onDeleteFinish?: () => void;
}) {
  const deleteTheme = useCSSLoaderAction("deleteTheme");
  async function deleteThemes() {
    for (let i = 0; i < themesToBeDeleted.length; i++) {
      await deleteTheme(themesToBeDeleted[i], i === themesToBeDeleted.length - 1);
    }
    onDeleteFinish?.();
    closeModal?.();
  }

  return (
    <ConfirmModal title="Delete Themes" onConfirm={deleteThemes} closeModal={closeModal}>
      <div>
        Are you sure you want to delete{" "}
        {themesToBeDeleted.length === 1 ? `this theme` : `these ${themesToBeDeleted.length} themes`}
        ?
      </div>
    </ConfirmModal>
  );
}
