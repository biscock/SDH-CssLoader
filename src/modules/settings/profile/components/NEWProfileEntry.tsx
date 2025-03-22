import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { ProfileDetailsModal, useThemeInstallState } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, Focusable, showModal, ToggleField } from "@decky/ui";
import { FaListUl } from "react-icons/fa6";

export function ProfileEntry({ data }: { data: Theme }) {
  const { isWorking } = useCSSLoaderValues();
  const { installTheme, changePreset } = useCSSLoaderActions();

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

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
        onOptionsActionDescription="View Details"
        onOptionsButton={() => {
          showModal(<ProfileDetailsModal data={data} />);
        }}
        onSecondaryActionDescription={isOutdated ? "Update Profile" : undefined}
        onSecondaryButton={isOutdated ? () => installTheme(data.id) : undefined}
      >
        <ToggleField
          disabled={isWorking}
          bottomSeparator="none"
          label={<span className="cl_themesettings_themelabel">{data.display_name}</span>}
          checked={data.enabled}
          onChange={(bool) => {
            if (bool) {
              changePreset(data.name);
            } else {
              changePreset("None");
            }
          }}
        />
        <DialogButton
          disabled={isWorking}
          className="cl_squaredialogbutton"
          onClick={() => {
            showModal(<ProfileDetailsModal data={data} />);
          }}
        >
          <FaListUl className="cl_squaredialogbutton_icontranslate" />
        </DialogButton>
      </Focusable>
    </div>
  );
}
