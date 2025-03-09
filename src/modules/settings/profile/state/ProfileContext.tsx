import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { Flags, PartialCSSThemeInfo, Theme } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const ProfileContext = createContext<IProfileContext>({} as IProfileContext);

// TODO: Potentially this should be moved to @cssloader as it isn't decky dependent
// TODO: Also, this should be zustand using .subscribe on the cssloader store, I just was lazy implementing it this way here
interface IProfileContextValues {
  displayMode: "offline" | "loggedout" | "loggedin";
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

  const [displayMode, setDisplayMode] = useState<"offline" | "loggedout" | "loggedin">("offline");
  const localProfiles = profiles.filter(
    (e) => updateStatuses.find((status) => status[0] === e.id)?.[1] === "local"
  );

  const [uploadedProfileRemoteEntries, setUploadedProfileRemoteEntries] = useState<
    PartialCSSThemeInfo[]
  >([]);

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
    if (!apiMeData) {
      setDisplayMode("loggedout");
      return;
    }

    // Logged in mode, separate downloaded and local, and show uploaded profiles
    const uploadedThemes = await getUploadedThemes();
    const uploadedProfileRemoteEntries = uploadedThemes.filter((theme) =>
      theme.targets.includes("Profile")
    );
    setUploadedProfileRemoteEntries(uploadedProfileRemoteEntries);
    setDisplayMode("loggedin");
  }

  useEffect(() => {
    void initialize();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        displayMode,
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

// const profileStore = createStore<IProfileStore>((set, get) => {
//   return {
//     displayMode: "offline",
//     downloadedProfiles: [],
//     localProfiles: [],
//     uploadedProfiles: [],
//     async initialize() {
//       const { apiMeData, updateStatuses, themes, getUploadedThemes } = getCSSLoaderState();
//       const profiles = themes.filter((e) => e.flags.includes(Flags.isPreset));
//       if (!updateStatuses) {
//         // Offline mode, no profile sorting, just one list
//         set({ displayMode: "offline", downloadedProfiles: profiles });
//         return;
//       }

//       let downloadedProfiles: Theme[] = [];
//       let localProfiles: Theme[] = [];
//       profiles.forEach((e) => {
//         if (updateStatuses.find((status) => status[0] === e.id)?.[1] === "local") {
//           localProfiles.push(e);
//         } else {
//           downloadedProfiles.push(e);
//         }
//       });

//       if (!apiMeData) {
//         // Logged out mode, separate downloaded and local, but no 'Uploaded' section
//         set({ displayMode: "loggedout", downloadedProfiles, localProfiles });
//         return;
//       }

//       // Logged in mode, separate downloaded and local, and show uploaded profiles
//       const uploadedThemes = await getUploadedThemes();
//       const uploadedProfileRemoteEntries = uploadedThemes.filter((theme) =>
//         theme.targets.includes("Profile")
//       );

//       // Since uploaded profiles are also technically 'downloaded', we have to manually filter them out
//       downloadedProfiles = downloadedProfiles.filter(
//         (profile) =>
//           !uploadedProfileRemoteEntries.some((uploadedProfile) => uploadedProfile.id === profile.id)
//       );
//       set({
//         displayMode: "loggedin",
//         downloadedProfiles,
//         localProfiles,
//         uploadedProfiles: uploadedProfileRemoteEntries,
//       });
//     },
//   };
// });

// export const useProfileStoreValues = generateStoreSelector<IProfileStoreValues>(profileStore);
// export const useProfileStoreActions = generateStoreSelector<IProfileStoreActions>(profileStore);
