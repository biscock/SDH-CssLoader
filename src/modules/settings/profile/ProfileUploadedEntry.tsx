import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useThemeInstallState } from "@/lib";
import { PartialCSSThemeInfo, Theme } from "@/types";
import { DialogButton, Focusable, PanelSectionRow } from "@decky/ui";
import { AiOutlineDownload } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

export function ProfileUploadedEntry({ data }: { data: PartialCSSThemeInfo }) {
  const { themes } = useCSSLoaderValues();
  const { isWorking } = useCSSLoaderValues();
  const { installTheme, deleteTheme } = useCSSLoaderActions();

  const associatedLocalTheme = themes.find((theme) => theme.id === data.id);

  const updateStatus = useThemeInstallState(data);
  const isOutdated = updateStatus === "outdated";

  return (
    <PanelSectionRow>
      <Focusable className="flex gap-2 py-0 px-[5px]">
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
