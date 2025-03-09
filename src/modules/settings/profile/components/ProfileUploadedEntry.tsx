import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useThemeInstallState } from "@/lib";
import { PartialCSSThemeInfo } from "@/types";
import { DialogButton, Focusable, PanelSectionRow } from "@decky/ui";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

export function ProfileUploadedEntry({ data }: { data: PartialCSSThemeInfo }) {
  const { themes } = useCSSLoaderValues();
  const { isWorking } = useCSSLoaderValues();
  const { installTheme, deleteTheme } = useCSSLoaderActions();

  const associatedLocalTheme = themes.find((theme) => theme.name === data.name);

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

  return (
    <PanelSectionRow>
      <Focusable className="flex gap-2 p-0">
        <div className="cl_profileentry_backdrop">
          <span>{data.displayName}</span>
        </div>
        {!!associatedLocalTheme ? (
          // This means that it is installed
          <>
            {isOutdated && (
              <DialogButton
                // className="cl_squaredialogbutton"
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
          </>
        ) : (
          <DialogButton
            className="cl_profileentry_actionbutton"
            onClick={() => installTheme(data.id)}
            disabled={isWorking}
          >
            <AiOutlineDownload />
            Download
          </DialogButton>
        )}
      </Focusable>
    </PanelSectionRow>
  );
}
