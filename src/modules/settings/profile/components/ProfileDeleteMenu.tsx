import { useCSSLoaderValues } from "@/backend";
import { DeleteMenu } from "@/lib";
import { Theme } from "@/types";
import { useMemo } from "react";
import { useProfileContext } from "../state";

// This is identical to the update all themes button, it just makes sense to update EVERYTHING
export function ProfileDeleteMenu({ disableDeleteMode }: { disableDeleteMode: () => void }) {
  const { downloadedProfiles, localProfiles, uploadedProfiles } = useProfileContext();
  const { updateStatuses, themes } = useCSSLoaderValues();

  const installedUploadedThemes: Theme[] = useMemo(() => {
    // Only show the 'on deckthemes' themes that are installed
    return uploadedProfiles
      .map((profile) => themes.find((theme) => theme.name === profile.name))
      .filter(Boolean) as Theme[];
  }, [updateStatuses, uploadedProfiles]);

  return (
    <DeleteMenu
      sortedThemeList={[...downloadedProfiles, ...localProfiles, ...installedUploadedThemes]}
      onLeave={disableDeleteMode}
      type="profile"
    />
  );
}
