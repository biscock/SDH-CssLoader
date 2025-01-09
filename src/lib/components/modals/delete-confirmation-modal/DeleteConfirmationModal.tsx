import { useCSSLoaderAction } from "@/backend";
import { ConfirmModal } from "../../../primitives";

export function DeleteConfirmationModal({
  closeModal,
  themeIdsToBeDeleted,
  onDeleteFinish,
}: {
  closeModal?: () => void;
  themeIdsToBeDeleted: string[];
  onDeleteFinish?: () => void;
}) {
  const deleteTheme = useCSSLoaderAction("deleteTheme");
  async function deleteThemes() {
    for (let i = 0; i < themeIdsToBeDeleted.length; i++) {
      await deleteTheme(themeIdsToBeDeleted[i], i === themeIdsToBeDeleted.length - 1);
    }
    onDeleteFinish?.();
    closeModal?.();
  }

  return (
    <ConfirmModal title="Delete Themes" onConfirm={deleteThemes} closeModal={closeModal}>
      <div>
        Are you sure you want to delete{" "}
        {themeIdsToBeDeleted.length === 1
          ? `this theme`
          : `these ${themeIdsToBeDeleted.length} themes`}
        ?
      </div>
    </ConfirmModal>
  );
}
