import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { ThemeSettingsModal, toggleThemeWithModals, useThemeInstallState } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import { BsGearFill } from "react-icons/bs";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export function ThemeSettingsEntry({ theme }: { theme: Theme }) {
  const unpinnedThemes = useCSSLoaderValue("unpinnedThemes");
  const isWorking = useCSSLoaderValue("isWorking");
  const isPinned = !unpinnedThemes.includes(theme.id);
  const updateStatus = useThemeInstallState(theme);
  const isOutdated = updateStatus === "outdated";

  const installTheme = useCSSLoaderAction("installTheme");
  const pinTheme = useCSSLoaderAction("pinTheme");
  const unpinTheme = useCSSLoaderAction("unpinTheme");

  return (
    <div className="relative">
      {updateStatus === "outdated" && (
        <div
          style={{
            position: "absolute",
            left: "-1em",
            top: "50%",
            transform: "translate(0,-50%)",
            width: "0.5em",
            height: "0.5em",
            backgroundColor: "#fca904",
            borderRadius: "100%",
          }}
        />
      )}
      <Focusable
        className="cl_themesettings_togglecontainer"
        onOptionsActionDescription="Expand Settings"
        onOptionsButton={() => {
          showModal(<ThemeSettingsModal themeId={theme.id} />);
        }}
        onSecondaryActionDescription={isOutdated ? "Update Theme" : undefined}
        onSecondaryButton={isOutdated ? () => installTheme(theme.id) : undefined}
      >
        <ToggleField
          disabled={isWorking}
          bottomSeparator="none"
          label={<span className="cl_themesettings_themelabel">{theme.display_name}</span>}
          checked={theme.enabled}
          onChange={(bool) => toggleThemeWithModals(theme, bool)}
        />
        <DialogButton
          disabled={isWorking}
          className="cl_squaredialogbutton"
          onClick={() => {
            if (isPinned) {
              unpinTheme(theme.id);
            } else {
              pinTheme(theme.id);
            }
          }}
        >
          {isPinned ? (
            <FaEye className="cl_squarebutton_icontranslate" />
          ) : (
            <FaEyeSlash className="cl_squarebutton_icontranslate" />
          )}
        </DialogButton>
        <DialogButton
          disabled={isWorking}
          className="cl_squaredialogbutton"
          onClick={() => {
            showModal(<ThemeSettingsModal themeId={theme.id} />);
          }}
        >
          <BsGearFill className="cl_squarebutton_icontranslate" />
        </DialogButton>
      </Focusable>
    </div>
  );
}
