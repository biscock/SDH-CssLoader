import { Focusable } from "@decky/ui";
import { ProfileInstalledEntry } from "./ProfileInstalledEntry";
import { useProfileContext } from "../state";
import { SectionTitle } from "./SectionTitle";
import { SectionSubtitle } from "./SectionSubtitle";
import { ProfileUploadedEntry } from "./ProfileUploadedEntry";

export function OnlineView() {
  const { downloadedProfiles, localProfiles, uploadedProfiles } = useProfileContext();
  return (
    <Focusable className="flex flex-col gap-4">
      {downloadedProfiles.length > 0 && (
        <>
          <Focusable className="flex flex-col gap-2">
            <SectionTitle>Downloaded Profiles</SectionTitle>
            <Focusable className="flex flex-col gap-1">
              {downloadedProfiles.map((profile) => (
                <ProfileInstalledEntry key={profile.id} data={profile} />
              ))}
            </Focusable>
          </Focusable>
          <div className="cl_divider" />
        </>
      )}
      {(localProfiles.length > 0 || uploadedProfiles.length > 0) && (
        <Focusable className="flex flex-col gap-2">
          <SectionTitle>Your Profiles</SectionTitle>
          {localProfiles.length > 0 && (
            <Focusable className="flex flex-col">
              <SectionSubtitle>Local</SectionSubtitle>
              <Focusable className="flex flex-col gap-1">
                {localProfiles.map((profile) => (
                  <ProfileInstalledEntry key={profile.id} data={profile} />
                ))}
              </Focusable>
            </Focusable>
          )}
          {uploadedProfiles.length > 0 && (
            <Focusable className="flex flex-col">
              <SectionSubtitle>On DeckThemes</SectionSubtitle>
              <Focusable className="flex flex-col gap-1">
                {uploadedProfiles.map((profile) => (
                  <ProfileUploadedEntry key={profile.id} data={profile} />
                ))}
              </Focusable>
            </Focusable>
          )}
        </Focusable>
      )}
    </Focusable>
  );
}
