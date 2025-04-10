import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { DialogButton } from "@decky/ui";

// This is identical to the update all themes button, it just makes sense to update EVERYTHING
export function DisableProfileButton() {
  const { selectedPreset } = useCSSLoaderValues();
  const { changePreset } = useCSSLoaderActions();

  if (!selectedPreset) {
    return null;
  }

  return (
    <DialogButton
      onClick={() => {
        changePreset("None");
      }}
    >
      Disable Current Profile
    </DialogButton>
  );
}
