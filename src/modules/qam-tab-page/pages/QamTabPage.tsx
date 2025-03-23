import { useCSSLoaderValues } from "@/backend";
import { MOTDDisplay, PresetSelectionDropdown } from "@/lib";
import { PanelSection } from "@decky/ui";
import { ShowModalButton } from "../../../TestModal";
import {
  QamDummyFunctionBoundary,
  QamHiddenThemesDisplay,
  QamRefreshButton,
  QamThemeList,
} from "../components";

export function QamTabPage() {
  const { themes } = useCSSLoaderValues();

  return (
    <>
      <MOTDDisplay />
      <ShowModalButton />
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
