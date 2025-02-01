import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { LocalThemeStatus, Theme } from "@/types";
import { DialogButton, Focusable, showModal } from "@decky/ui";
import { FaDownload, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa6";
import { DeleteConfirmationModal } from "../delete-confirmation-modal";
import { useThemeInstallState } from "../../../hooks";

// TODO: Re-add star status to this modal
export function ThemeSettingsModalActionButtons({
  theme,
  closeModal,
}: {
  theme: Theme;
  closeModal?: () => void;
}) {
  const { isWorking, unpinnedThemes } = useCSSLoaderValues();
  const { installTheme, pinTheme, unpinTheme } = useCSSLoaderActions();

  // Update Check
  const updateStatus = useThemeInstallState(theme);
  const isOutdated = updateStatus === "outdated";
  function handleUpdate() {
    void installTheme(theme.id);
  }

  // Pinning
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
          <FaDownload className="cl_squaredialogbutton_icontranslate" />
          <span className="text-xs">Update</span>
        </DialogButton>
      )}
      <DialogButton disabled={isWorking} className="cl_squaredialogbutton" onClick={handlePinClick}>
        {isPinned ? (
          <FaEye className="cl_squaredialogbutton_icontranslate" />
        ) : (
          <FaEyeSlash className="cl_squaredialogbutton_icontranslate" />
        )}
      </DialogButton>
      <DialogButton
        disabled={isWorking}
        className="cl_squaredialogbutton"
        onClick={() => {
          showModal(
            <DeleteConfirmationModal themeIdsToBeDeleted={[theme.id]} onDeleteFinish={closeModal} />
          );
        }}
      >
        <FaTrash className="cl_squaredialogbutton_icontranslate" />
      </DialogButton>
    </Focusable>
  );
}
