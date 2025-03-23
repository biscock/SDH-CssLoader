import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useThemeInstallState } from "@/lib";
import { PartialCSSThemeInfo } from "@/types";
import { DialogButton, Focusable } from "@decky/ui";
import { FaDownload } from "react-icons/fa6";

export function ProfileUploadedEntry({ data }: { data: PartialCSSThemeInfo }) {
  const { isWorking } = useCSSLoaderValues();
  const { installTheme } = useCSSLoaderActions();

  const updateStatus = useThemeInstallState(data);

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
        onOKActionDescription="Download Profile"
        onActivate={() => {
          installTheme(data.id);
        }}
        className="cl_profilesettings_radiocontainer opacity-50"
      >
        <span>{data.displayName}</span>
        <span>Not Installed</span>
      </Focusable>
      <DialogButton
        disabled={isWorking}
        className="cl_squaredialogbutton"
        onClick={() => {
          installTheme(data.id);
        }}
      >
        <FaDownload className="cl_squaredialogbutton_icontranslate" />
      </DialogButton>
    </div>
  );
}
