import { Focusable } from "@decky/ui";
import { useProfileContext } from "../state";
import { ProfileInstalledEntry } from "./ProfileInstalledEntry";

export function OfflineView() {
  const { downloadedProfiles } = useProfileContext();
  return (
    <Focusable className="!flex !flex-col !gap-1">
      {downloadedProfiles.map((profile) => (
        <ProfileInstalledEntry key={profile.id} data={profile} />
      ))}
    </Focusable>
  );
}
