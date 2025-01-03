import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { useDeckyPatchStateAction, useDeckyPatchStateValue } from "@/decky-patches";
import { DropdownItem, Focusable, ToggleField } from "@decky/ui";

export function PluginSettingsPage() {
  const serverState = useCSSLoaderValue("serverState");
  const watchState = useCSSLoaderValue("watchState");
  const translationsBranch = useCSSLoaderValue("translationsBranch");

  const setServerState = useCSSLoaderAction("setServerState");
  const setWatchState = useCSSLoaderAction("setWatchState");
  const setTranslationBranch = useCSSLoaderAction("setTranslationBranch");

  const unminifyModeOn = useDeckyPatchStateValue("unminifyModeOn");
  const navPatchInstance = useDeckyPatchStateValue("navPatchInstance");
  const setNavPatchState = useDeckyPatchStateAction("setNavPatchState");
  const setUnminifyModeState = useDeckyPatchStateAction("setUnminifyModeState");
  return (
    <Focusable>
      <Focusable>
        <DropdownItem
          rgOptions={[
            { data: "-1", label: "Auto-Detect" },
            { data: "0", label: "Force Stable" },
            { data: "1", label: "Force Beta" },
          ]}
          selectedOption={translationsBranch}
          label="SteamOS Branch"
          description="Choose the version of SteamOS you are on. This allows us to provide the correct translations for your system."
          onChange={(data) => setTranslationBranch(data.data)}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={serverState}
          label="Enable Standalone Backend"
          description="Enables support for CSS Loader Desktop on Linux"
          onChange={(value) => {
            setServerState(value);
          }}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={!!navPatchInstance}
          label="Enable Nav Patch"
          description="Fixes issues with themes that attempt to hide elements of the UI"
          onChange={(value) => setNavPatchState(value, true)}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={watchState}
          label="Live CSS Editing"
          description="Watches ~/homebrew/themes for any changes and automatically re-injects CSS"
          onChange={setWatchState}
        />
      </Focusable>
      <Focusable>
        <ToggleField
          checked={unminifyModeOn}
          label="Unminify Mode"
          description="Adds unminified classnames to devtools view, resets on steam client restart"
          onChange={(value) => setUnminifyModeState(value, true)}
        />
      </Focusable>
    </Focusable>
  );
}
