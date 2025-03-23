import { PresetSelectionDropdown } from "@/lib";
import { Focusable } from "@decky/ui";
import { ImSpinner5 } from "react-icons/im";
import { OfflineView, OnlineView } from "../components";
import { ProfileContextProvider, useProfileContext } from "../state";

export function ProfileSettingsPage() {
  return (
    <ProfileContextProvider>
      <ProfileSettingsPageContent />
    </ProfileContextProvider>
  );
}

function ProfileSettingsPageContent() {
  const { loading } = useProfileContext();
  return (
    <Focusable className="cl_settingspage_container !flex !flex-col !gap-4">
      <PresetSelectionDropdown noBottomSeparator />
      <div className="cl_divider" />
      <ProfileSettingsModeSwitcher />
      {loading && (
        <div className="h-full w-full flex items-center justify-center gap-4">
          <ImSpinner5 className="cl_spinny" size={48} />
        </div>
      )}
    </Focusable>
  );
}

function ProfileSettingsModeSwitcher() {
  const { displayMode } = useProfileContext();
  if (displayMode === "online") {
    return <OnlineView />;
  }
  return <OfflineView />;
}
