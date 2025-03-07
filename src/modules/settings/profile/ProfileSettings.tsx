import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { PresetSelectionDropdown } from "@/lib";
import { Flags, PartialCSSThemeInfo, Theme } from "@/types";
import { DialogButton, Focusable } from "@decky/ui";
import { ProfileInstalledEntry } from "./ProfileInstalledEntry";
import { useEffect, useMemo, useState } from "react";
import { ProfileUploadedEntry } from "./ProfileUploadedEntry";

export function ProfileSettings() {
  const { themes, updateStatuses, apiMeData } = useCSSLoaderValues();
  const profiles = themes.filter((e) => e.flags.includes(Flags.isPreset));

  return (
    <Focusable className="cl_settingspage_container flex flex-col gap-4">
      <PresetSelectionDropdown noBottomSeparator />
      <div className="cl_divider" />
      <ProfileSettingsList />
    </Focusable>
  );
}

function ProfileSettingsList() {
  const { themes, apiMeData } = useCSSLoaderValues();
  const { getUploadedThemes } = useCSSLoaderActions();
  const profiles = themes.filter((e) => e.flags.includes(Flags.isPreset));

  const [uploadedProfileRemoteEntries, setUploadedProfileRemoteEntries] = useState<
    PartialCSSThemeInfo[]
  >([]);
  useEffect(() => {
    if (apiMeData) {
      const fetchUploadedThemes = async () => {
        const uploadedThemes = await getUploadedThemes();
        const uploadedProfiles = uploadedThemes.filter((theme) =>
          theme.targets.includes("Profile")
        );
        setUploadedProfileRemoteEntries(uploadedProfiles);
      };

      fetchUploadedThemes();
    }
  }, [apiMeData]);

  // Installed Profiles is any profile that doesn't belong in the uploaded section
  const installedProfiles = useMemo(() => {
    return profiles.filter(
      (profile) =>
        !uploadedProfileRemoteEntries.some((uploadedProfile) => uploadedProfile.id === profile.id)
    );
  }, [profiles, uploadedProfileRemoteEntries]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-lg font-bold">Installed Profiles</span>
        <Focusable className="flex flex-col gap-1">
          {installedProfiles.map((profile) => (
            <ProfileInstalledEntry key={profile.id} data={profile} />
          ))}
        </Focusable>
      </div>
      {!!apiMeData && (
        <>
          {uploadedProfileRemoteEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-lg font-bold">Your Uploaded Profiles</span>
              <Focusable className="flex flex-col gap-1">
                {uploadedProfileRemoteEntries.map((profile) => (
                  <ProfileUploadedEntry key={profile.id} data={profile} />
                ))}
              </Focusable>
            </div>
          )}
          <UploadProfileButton />
        </>
      )}
    </>
  );
}

function UploadProfileButton() {
  const { publishProfile } = useCSSLoaderActions();
  return (
    <DialogButton
      onClick={() => {
        publishProfile("LCD Hero.profile", false);
      }}
    >
      Upload Profile
    </DialogButton>
  );
}
