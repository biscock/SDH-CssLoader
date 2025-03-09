import { getCSSLoaderState } from "@/backend";
import { StyleProvider, TitleView } from "@/lib";
import { QamTabPage } from "@/modules/qam-tab-page";
import { definePlugin, routerHook } from "@decky/api";
import { RiPaintFill } from "react-icons/ri";
import { getDeckyPatchState } from "./decky-patches";
import { ExpandedViewPage } from "./modules/expanded-view";
import { SettingsPageRouter } from "./modules/settings";
import { ThemeStoreRouter } from "./modules/theme-store";

export default definePlugin(() => {
  getCSSLoaderState().initializeStore();
  getDeckyPatchState().initializeStore();

  routerHook.addRoute("/cssloader/theme-store", () => (
    <StyleProvider>
      <ThemeStoreRouter />
    </StyleProvider>
  ));

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
