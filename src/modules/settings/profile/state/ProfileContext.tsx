import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { Flags, PartialCSSThemeInfo, Theme } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext<IProfileContext>({} as IProfileContext);

// TODO: Potentially this should be moved to @cssloader as it isn't decky dependent
// TODO: Also, this should be zustand using .subscribe on the cssloader store, I just was lazy implementing it this way here
interface IProfileContextValues {
  displayMode: "offline" | "online";
  loading: boolean;
  downloadedProfiles: Theme[];
  localProfiles: Theme[];
  uploadedProfiles: PartialCSSThemeInfo[];
}

interface IProfileContextActions {
  initialize: () => void;
}

interface IProfileContext extends IProfileContextValues, IProfileContextActions {}

export function ProfileContextProvider({ children }: { children: React.ReactNode }) {
  const { themes, updateStatuses, apiMeData } = useCSSLoaderValues();
  const { getUploadedThemes } = useCSSLoaderActions();
  const profiles = themes.filter((e) => e.flags.includes(Flags.isPreset));

  const [displayMode, setDisplayMode] = useState<"offline" | "online">("offline");
  const [loading, setLoading] = useState(true);

  const [uploadedProfileRemoteEntries, setUploadedProfileRemoteEntries] = useState<
    PartialCSSThemeInfo[]
  >([]);

  const localProfiles = profiles.filter((e) => {
    const isLocal = updateStatuses.find((status) => status[0] === e.id)?.[1] === "local";
    const isInUploaded = uploadedProfileRemoteEntries.some(
      (uploadedProfile) => uploadedProfile.id === e.id
    );
    return isLocal && !isInUploaded;
  });
  const downloadedProfiles = profiles.filter((profile) => {
    const isInLocal = localProfiles.some((localProfile) => localProfile.id === profile.id);
    const isInUploaded = uploadedProfileRemoteEntries.some(
      (uploadedProfile) => uploadedProfile.id === profile.id
    );
    return !isInLocal && !isInUploaded;
  });

  async function initialize() {
    if (!updateStatuses) {
      setDisplayMode("offline");
      return;
    }

    setDisplayMode("online");
    if (!apiMeData) {
      return;
    }

    setLoading(true);
    // Logged in mode, separate downloaded and local, and show uploaded profiles
    const uploadedThemes = await getUploadedThemes();
    const uploadedProfileRemoteEntries = uploadedThemes.filter((theme) =>
      theme.targets.includes("Profile")
    );
    setUploadedProfileRemoteEntries(uploadedProfileRemoteEntries);
    setLoading(false);
  }

  useEffect(() => {
    void initialize();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        displayMode,
        loading,
        downloadedProfiles,
        localProfiles,
        uploadedProfiles: uploadedProfileRemoteEntries,
        initialize,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => useContext(ProfileContext);
