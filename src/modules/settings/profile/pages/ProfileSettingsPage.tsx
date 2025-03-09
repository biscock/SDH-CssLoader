import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { PresetSelectionDropdown } from "@/lib";
import { Flags, PartialCSSThemeInfo, Theme } from "@/types";
import { DialogButton, Focusable } from "@decky/ui";
import { useEffect, useMemo, useState } from "react";
import { ProfileContextProvider, useProfileContext } from "../state";
import { OfflineView } from "../components/OfflineView";
import { LoggedInView } from "../components/LoggedInView";
import { LoggedOutView } from "../components/LoggedOutView";

export function ProfileSettingsPage() {
  return (
    <ProfileContextProvider>
      <Focusable className="cl_settingspage_container flex flex-col gap-4">
        <PresetSelectionDropdown noBottomSeparator />
        <div className="cl_divider" />
        <ProfileSettingsContent />
      </Focusable>
    </ProfileContextProvider>
  );
}

function ProfileSettingsContent() {
  const { displayMode } = useProfileContext();
  if (displayMode === "loggedin") {
    return <LoggedInView />;
  }
  if (displayMode === "loggedout") {
    return <LoggedOutView />;
  }
  return <OfflineView />;
}

// function UploadProfileButton() {
//   const { publishProfile } = useCSSLoaderActions();
//   return (
//     <DialogButton
//       onClick={() => {
//         publishProfile("LCD Hero.profile", false);
//       }}
//     >
//       Upload Profile
//     </DialogButton>
//   );
// }
