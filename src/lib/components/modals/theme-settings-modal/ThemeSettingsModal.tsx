import { useCSSLoaderValue } from "@/backend";
import { Modal } from "../../../primitives";
import { DialogButton, Focusable, Toggle } from "@decky/ui";
import { toggleThemeWithModals } from "../../../utils";
import { ThemePatch } from "../../theme-patch";
import { ThemeSettingsModalActionButtons } from "./ThemeSettingsModalActionButtons";

export function ThemeSettingsModal({
  closeModal,
  themeId,
}: {
  closeModal?: () => void;
  themeId: string;
}) {
  const themes = useCSSLoaderValue("themes");
  const theme = themes.find((theme) => theme.id === themeId);

  return (
    <Modal>
      {!!theme ? (
        <Focusable className="flex flex-col gap-4 w-full">
          <Focusable className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <span className="cl_title">{theme.display_name}</span>
              <span className="text-xs">
                {theme.version} | {theme.author}
              </span>
            </div>
            <Toggle
              value={theme.enabled}
              onChange={(checked) => {
                toggleThemeWithModals(theme, checked);
              }}
            />
          </Focusable>
          {theme.enabled && theme.patches.length > 0 ? (
            <Focusable>
              {theme.patches.map((patch, index) => (
                <ThemePatch
                  key={patch.name}
                  patch={patch}
                  themeName={theme.name}
                  shouldHaveBottomSeparator={theme.patches.length - 1 === index}
                  inModal
                />
              ))}
            </Focusable>
          ) : null}
          <Focusable className="flex flex-row justify-between items-center">
            <DialogButton onClick={closeModal}>Close</DialogButton>
            <ThemeSettingsModalActionButtons theme={theme} closeModal={closeModal} />
          </Focusable>
        </Focusable>
      ) : (
        <Focusable>
          <span className="cl_title">Theme Not Found</span>
          <DialogButton onClick={closeModal}>Go Back</DialogButton>
        </Focusable>
      )}
    </Modal>
  );
}
