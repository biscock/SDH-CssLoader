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
        <span>{data.display_name}</span>
        <Focusable className="flex ml-auto gap-2">
          {isOutdated && (
            <DialogButton
              className="cl_squaredialogbutton"
              onClick={() => installTheme(data.id)}
              disabled={isWorking}
            >
              <AiOutlineDownload />
            </DialogButton>
          )}
          <DialogButton
            className="cl_squaredialogbutton"
            onClick={() => deleteTheme(data.id)}
            disabled={isWorking}
          >
            <FaTrash />
          </DialogButton>
        </Focusable>
      </div>
    </PanelSectionRow>
  );
}
