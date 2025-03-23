import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useDeckyPatchStateActions, useDeckyPatchStateValues } from "@/decky-patches";
import { ButtonItem, DropdownItem, Focusable, ToggleField } from "@decky/ui";
import { Selectable } from "../../../lib/primitives";

export function PluginSettingsPage() {
  const { serverState, watchState, translationsBranch, mappingsVersionStr } = useCSSLoaderValues();
  const { setServerState, setWatchState, setTranslationBranch } = useCSSLoaderActions();

  const { unminifyModeOn, navPatchInstance } = useDeckyPatchStateValues();
  const { setNavPatchState, setUnminifyModeState, dumpMappings } = useDeckyPatchStateActions();
  return (
    <Focusable className="cl_settingspage_container">
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
      <Focusable>
        <ButtonItem
          label="Save Mappings"
          description="Saves your Steam client version's CSS classnames to a file for analysis"
          onClick={dumpMappings}
        >
          Save
        </ButtonItem>
      </Focusable>
      <Focusable>
        <DropdownItem
          rgOptions={[
            { data: "-1", label: "Auto-Detect" },
            { data: "0", label: "Force Stable" },
            { data: "1", label: "Force Beta" },
          ]}
          selectedOption={translationsBranch}
          label="Steam Client Branch"
          description="This allows us to provide the correct translations for your system."
          onChange={(data) => setTranslationBranch(data.data)}
        />
      </Focusable>
      <Selectable className="!mt-4">
        <span>
          <b>Mappings Version:</b> <span className="font-mono">{mappingsVersionStr}</span>
        </span>
      </Selectable>
    </Focusable>
  );
}
