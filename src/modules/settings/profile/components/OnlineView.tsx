import { UploadProfileModal } from "@/lib";
import { DialogButton, Focusable, showModal } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { useProfileContext } from "../state";
import { ProfileInstalledEntry } from "./ProfileInstalledEntry";
import { ProfileUploadedEntry } from "./ProfileUploadedEntry";
import { SectionSubtitle } from "./SectionSubtitle";
import { SectionTitle } from "./SectionTitle";

export function OnlineView() {
  const { downloadedProfiles, localProfiles, uploadedProfiles, initialize, loading } =
    useProfileContext();

  const firstElementRef = useRef<HTMLDivElement>(null);

  // When the fetch for online profiles returns, if the user had a 'your profile' item selected, the focus would be dropped and the next down would switch tabs to plugin settings
  // We don't want this, so if the list was focused originally, we focus the first element
  // (in theory a more complex system could refocus the exact same element, but that would be even more work for an edge case)
  const [yourProfilesListFocused, setYourProfilesListFocused] = useState(false);
  useEffect(() => {
    if (!loading && yourProfilesListFocused) {
      setTimeout(() => {
        firstElementRef.current?.focus();
      }, 10);
    }
  }, [loading]);

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
        <Focusable
          className="flex flex-col gap-2"
          onGamepadFocus={() => {
            setYourProfilesListFocused(true);
          }}
          onGamepadBlur={() => {
            setYourProfilesListFocused(false);
          }}
        >
          <SectionTitle>Your Profiles</SectionTitle>
          {localProfiles.length > 0 && (
            <Focusable className="flex flex-col">
              <SectionSubtitle>Local</SectionSubtitle>
              <Focusable className="flex flex-col gap-1">
                {localProfiles.map((profile, index) => (
                  <ProfileInstalledEntry
                    passthroughRef={index === 0 ? firstElementRef : undefined}
                    key={profile.id}
                    data={profile}
                  />
                ))}
              </Focusable>
            </Focusable>
          )}
          {uploadedProfiles.length > 0 && (
            <Focusable className="flex flex-col">
              <SectionSubtitle>On DeckThemes</SectionSubtitle>
              <Focusable className="flex flex-col gap-1">
                {uploadedProfiles.map((profile, index) => (
                  <ProfileUploadedEntry
                    passthroughRef={
                      localProfiles.length === 0 && index === 0 ? firstElementRef : undefined
                    }
                    key={profile.id}
                    data={profile}
                  />
                ))}
              </Focusable>
            </Focusable>
          )}
        </Focusable>
      )}
      <DialogButton
        onClick={() => {
          showModal(
            <UploadProfileModal
              onUploadFinish={() => {
                void initialize();
              }}
              eligibleProfiles={localProfiles}
            />
          );
        }}
      >
        Upload Profile
      </DialogButton>
    </Focusable>
  );
}
