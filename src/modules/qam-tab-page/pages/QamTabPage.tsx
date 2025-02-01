import { PanelSection } from "@decky/ui";
import { MOTDDisplay, PresetSelectionDropdown } from "@/lib";
import {
  QamDummyFunctionBoundary,
  QamHiddenThemesDisplay,
  QamRefreshButton,
  QamThemeList,
} from "../components";
import { useCSSLoaderValues } from "@/backend";

export function QamTabPage() {
  const { themes } = useCSSLoaderValues();

  return (
    <>
      <MOTDDisplay />
      <QamDummyFunctionBoundary>
        <PanelSection title="Themes">
          {themes.length > 0 && <PresetSelectionDropdown />}
          <QamThemeList />
          <QamHiddenThemesDisplay />
        </PanelSection>
      </QamDummyFunctionBoundary>
      <PanelSection>
        <QamRefreshButton />
      </PanelSection>
    </>
  );
}
