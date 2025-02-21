import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { PresetSelectionDropdown, useThemeInstallState } from "@/lib";
import { Flags, LocalThemeStatus, Theme } from "@/types";
import { DialogButton, Focusable, PanelSectionRow } from "@decky/ui";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

export function ProfileSettings() {
  const { themes } = useCSSLoaderValues();
  const profiles = themes.filter((e) => e.flags.includes(Flags.isPreset));

  return (
    <Focusable>
      <PresetSelectionDropdown />
      <Focusable className="flex flex-col gap-2 mt-4">
        {profiles.map((profile) => (
          <ProfileEntry key={profile.id} data={profile} />
        ))}
      </Focusable>
    </Focusable>
  );
}

function ProfileEntry({ data }: { data: Theme }) {
  const { isWorking } = useCSSLoaderValues();
  const { installTheme, deleteTheme } = useCSSLoaderActions();

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

  return (
    <PanelSectionRow>
      <div className="grid grid-cols-[1fr,2fr] items-center p-0">
        <span>{data.name}</span>
        <div className="flex">
          {isOutdated && (
            <DialogButton
              style={{
                marginRight: "8px",
                minWidth: "calc(50% - 8px)",
                maxWidth: "calc(50% - 8px)",
                filter: "invert(6%) sepia(90%) saturate(200%) hue-rotate(160deg) contrast(122%)",
              }}
              onClick={() => installTheme(data.id)}
              disabled={isWorking}
            >
              <AiOutlineDownload />
            </DialogButton>
          )}
          <DialogButton
            style={{
              minWidth: "calc(50% - 8px)",
              maxWidth: "calc(50% - 8px)",
              marginLeft: "auto",
            }}
            onClick={() => deleteTheme(data.id)}
            disabled={isWorking}
          >
            <FaTrash />
          </DialogButton>
        </div>
      </div>
    </PanelSectionRow>
  );
}
