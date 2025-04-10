import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { DialogButton } from "@decky/ui";
import { FaDownload } from "react-icons/fa6";

// This is identical to the update all themes button, it just makes sense to update EVERYTHING
export function UpdateAllProfilesButton() {
  const { updateStatuses } = useCSSLoaderValues();
  const { installTheme } = useCSSLoaderActions();

  async function updateAll() {
    const outdatedThemes = updateStatuses.filter((f) => f[1] === "outdated").map((f) => f[0]);
    for (const themeId of outdatedThemes) {
      await installTheme(themeId);
    }
  }

  return (
    <>
      {updateStatuses.filter((e) => e[1] === "outdated").length > 0 && (
        <DialogButton className="flex items-center justify-center gap-2" onClick={updateAll}>
          <FaDownload />
          <span>Update All Profiles</span>
        </DialogButton>
      )}
    </>
  );
}
