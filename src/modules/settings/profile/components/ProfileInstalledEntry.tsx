import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { cn, ProfileDetailsModal, useThemeInstallState } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, Focusable, showModal } from "@decky/ui";
import { useState } from "react";
import { FaListUl } from "react-icons/fa6";

export function ProfileInstalledEntry({
  data,
  passthroughRef,
}: {
  data: Theme;
  passthroughRef?: React.Ref<HTMLDivElement>;
}) {
  const { isWorking, selectedPreset } = useCSSLoaderValues();
  const { installTheme, changePreset } = useCSSLoaderActions();

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

  const isSelected = selectedPreset?.id === data.id;

  const [isChanging, setIsChanging] = useState(false);

  return (
    <Focusable className="relative flex flex-row gap-1">
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
        ref={passthroughRef}
        focusWithinClassName="gpfocuswithin"
        onActivate={async () => {
          if (isSelected || isChanging) return;
          setIsChanging(true);
          await changePreset(data.name);
          setIsChanging(false);
        }}
        onOKActionDescription="Select Profile"
        onOptionsActionDescription="View Details"
        onOptionsButton={() => {
          showModal(<ProfileDetailsModal data={data} />);
        }}
        onSecondaryActionDescription={isOutdated ? "Update Profile" : undefined}
        onSecondaryButton={isOutdated ? () => installTheme(data.id) : undefined}
        className={cn("cl_profilesettings_radiocontainer", isChanging && "opacity-50")}
      >
        <span>{data.display_name}</span>
        <div className="border-2 border-white rounded-full flex items-center justify-center w-4 h-4 p-1">
          {isSelected ? <div className="w-full h-full bg-white rounded-full" /> : null}
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
    </Focusable>
  );
}
