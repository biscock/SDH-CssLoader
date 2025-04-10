import { DialogButton, Focusable } from "@decky/ui";
import { useState } from "react";
import { ImSpinner5 } from "react-icons/im";
import {
  DisableProfileButton,
  OfflineView,
  OnlineView,
  ProfileDeleteMenu,
  UpdateAllProfilesButton,
} from "../components";
import { ProfileContextProvider, useProfileContext } from "../state";

export function ProfileSettingsPage() {
  const [deleteMode, setDeleteMode] = useState(false);
  return (
    <ProfileContextProvider>
      <Focusable className="flex gap-4 mb-4">
        <DisableProfileButton />
        <DialogButton
          className="CSSLoader_InstalledThemes_ModeButton"
          onClick={() => setDeleteMode(!deleteMode)}
        >
          {deleteMode ? "Go Back" : "Delete Profiles"}
        </DialogButton>
        <UpdateAllProfilesButton />
      </Focusable>
      {deleteMode ? (
        <ProfileDeleteMenu disableDeleteMode={() => setDeleteMode(false)} />
      ) : (
        <ProfileSettingsPageContent />
      )}
    </ProfileContextProvider>
  );
}

function ProfileSettingsPageContent() {
  const { loading } = useProfileContext();
  return (
    <Focusable className="cl_settingspage_container flex flex-col gap-4">
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
