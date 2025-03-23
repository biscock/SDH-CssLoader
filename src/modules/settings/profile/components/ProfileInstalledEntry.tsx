import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { ProfileDetailsModal, useThemeInstallState } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, Focusable, showModal } from "@decky/ui";
import { FaListUl } from "react-icons/fa6";

export function ProfileInstalledEntry({ data }: { data: Theme }) {
  const { isWorking, selectedPreset } = useCSSLoaderValues();
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
        focusWithinClassName="gpfocuswithin"
        onActivate={() => {
          changePreset(data.name);
        }}
        onOKActionDescription="Select Profile"
        onOptionsActionDescription="View Details"
        onOptionsButton={() => {
          showModal(<ProfileDetailsModal data={data} />);
        }}
        onSecondaryActionDescription={isOutdated ? "Update Profile" : undefined}
        onSecondaryButton={isOutdated ? () => installTheme(data.id) : undefined}
        className="cl_profilesettings_radiocontainer"
      >
        <span>{data.display_name}</span>
        <div className="border-2 border-white rounded-full flex items-center justify-center w-6 h-6 p-2">
          {selectedPreset?.id === data.id ? (
            <div className="w-full h-full bg-white rounded-full" />
          ) : null}
        </div>
      </Focusable>
      <DialogButton
        disabled={isWorking}
        className="cl_squaredialogbutton"
        onClick={() => {
          showModal(<ProfileDetailsModal data={data} />);
        }}
      >
        <FaListUl className="cl_squaredialogbutton_icontranslate" />
      </DialogButton>
    </div>
  );
}
