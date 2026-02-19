import { getCSSLoaderState } from "@/backend";
import { StyleProvider, TitleView } from "@/lib";
import { QamTabPage } from "@/modules/qam-tab-page";
import { definePlugin, routerHook } from "@decky/api";
import { RiPaintFill } from "react-icons/ri";
import { getDeckyPatchState } from "./decky-patches";
import { ExpandedViewPage } from "./modules/expanded-view";
import { SettingsPageRouter } from "./modules/settings";
import { ThemeStoreRouter } from "./modules/theme-store";
import {
  getThemeBrowserSharedState,
  THEME_STORE_FIRST_TAB_ID,
} from "./modules/theme-store/context";

export default definePlugin(() => {
  getCSSLoaderState().initializeStore();
  getDeckyPatchState().initializeStore();

  routerHook.addRoute("/cssloader/theme-store", () => {
    // When you navigate from theme store to another page and back, valve will automatically restore the focus to where it was
    // However, when you close this tab and go back, focus is reset to the beginning, so we also need to reset our saved tab value back to default
    const state = getThemeBrowserSharedState();
    if (!state.skipNextTabReset) {
      state.setCurrentTab(THEME_STORE_FIRST_TAB_ID);
    }
    state.setSkipNextTabReset(false);
    return (
      <StyleProvider>
        <ThemeStoreRouter />
      </StyleProvider>
    );
  });

  routerHook.addRoute("/cssloader/expanded-view", () => (
    <StyleProvider>
      <ExpandedViewPage />
    </StyleProvider>
  ));

  routerHook.addRoute("/cssloader/settings", () => (
    <StyleProvider>
      <SettingsPageRouter />
    </StyleProvider>
  ));

  return {
    name: "SDH-CSSLoader",
    titleView: (
      <StyleProvider>
        <TitleView />
      </StyleProvider>
    ),
    title: <div>CSSLoader</div>,
    icon: <RiPaintFill />,
    content: (
      <StyleProvider>
        <QamTabPage />
      </StyleProvider>
    ),
    alwaysRender: true,
    onDismount: () => {
      getCSSLoaderState().deactivate();
      getDeckyPatchState().deactivate();
    },
  };
});
