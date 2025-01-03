import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { LocalThemeStatus, Theme } from "@/types";
import { DialogButton, Focusable, showModal } from "@decky/ui";
import { FaDownload, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa6";
import { DeleteConfirmationModal } from "../delete-confirmation-modal";

// TODO: Re-add star status to this modal
export function ThemeSettingsModalActionButtons({
  theme,
  closeModal,
}: {
  theme: Theme;
  closeModal?: () => void;
}) {
  const isWorking = useCSSLoaderValue("isWorking");

  // Update Check
  const updateStatuses = useCSSLoaderValue("updateStatuses");
  const installTheme = useCSSLoaderAction("installTheme");

  let updateStatus: LocalThemeStatus = "installed";
  const themeArrPlace = updateStatuses.find((f) => f[0] === theme.id);
  if (themeArrPlace) updateStatus = themeArrPlace[1];
  const isOutdated = updateStatus === "outdated";

  function handleUpdate() {
    void installTheme(theme.id);
  }

  // Pinning
  const unpinnedThemes = useCSSLoaderValue("unpinnedThemes");
  const pinTheme = useCSSLoaderAction("pinTheme");
  const unpinTheme = useCSSLoaderAction("unpinTheme");
  const isPinned = !unpinnedThemes.includes(theme.id);
  function handlePinClick() {
    if (isPinned) {
      void unpinTheme(theme.id);
    } else {
      void pinTheme(theme.id);
    }
  }

  return (
    <Focusable className="flex flex-row gap-1">
      {isOutdated && (
        <DialogButton
          disabled={isWorking}
          onClick={handleUpdate}
          className="cl_squaredialogbutton flex gap-1"
        >
          <FaDownload />
          <span className="text-xs">Update</span>
        </DialogButton>
      )}
      <DialogButton disabled={isWorking} className="cl_squaredialogbutton" onClick={handlePinClick}>
        {isPinned ? <FaEye /> : <FaEyeSlash />}
      </DialogButton>
      <DialogButton
        disabled={isWorking}
        className="cl_squaredialogbutton"
        onClick={() => {
          showModal(
            <DeleteConfirmationModal themesToBeDeleted={[theme.id]} onDeleteFinish={closeModal} />
          );
        }}
      >
        <FaTrash />
      </DialogButton>
    </Focusable>
  );
}
