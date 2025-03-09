import { Focusable } from "@decky/ui";
import { ProfileInstalledEntry } from "./ProfileInstalledEntry";
import { useProfileContext } from "../state";
import { SectionTitle } from "./SectionTitle";

export function LoggedOutView() {
  const { downloadedProfiles, localProfiles } = useProfileContext();
  return (
    <Focusable className="flex flex-col gap-4">
      <Focusable className="flex flex-col gap-2">
        <SectionTitle>Downloaded Profiles</SectionTitle>
        <Focusable className="flex flex-col gap-1">
          {downloadedProfiles.map((profile) => (
            <ProfileInstalledEntry key={profile.id} data={profile} />
          ))}
        </Focusable>
      </Focusable>
      <div className="cl_divider" />
      <Focusable className="flex flex-col gap-2">
        <SectionTitle>Your Profiles</SectionTitle>
        <Focusable className="flex flex-col gap-1">
          {localProfiles.map((profile) => (
            <ProfileInstalledEntry key={profile.id} data={profile} />
          ))}
        </Focusable>
      </Focusable>
    </Focusable>
  );
}
