import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useThemeInstallState } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, Focusable, PanelSectionRow } from "@decky/ui";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

export function ProfileInstalledEntry({ data }: { data: Theme }) {
  const { isWorking } = useCSSLoaderValues();
  const { installTheme, deleteTheme } = useCSSLoaderActions();

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

  return (
    <PanelSectionRow>
      <Focusable className="flex gap-2 p-0">
        <div className="cl_profileentry_backdrop">
          <span>{data.display_name}</span>
        </div>
        {isOutdated && (
          <DialogButton
            className="cl_profileentry_actionbutton"
            onClick={() => installTheme(data.id)}
            disabled={isWorking}
          >
            <AiOutlineDownload />
            Update
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
    </PanelSectionRow>
  );
}
