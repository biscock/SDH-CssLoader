import { Tabs } from "@decky/ui";
import { ThemeBrowserPage, ThemeCardCSSVariableProvider } from "../components";
import {
  ThemeBrowserStoreProvider,
  useThemeBrowserSharedAction,
  useThemeBrowserSharedValue,
} from "../context";

// TODO: Make the tab definition a constant so that it isn't re-generated every page load

export function ThemeStoreRouter() {
  const currentTab = useThemeBrowserSharedValue("currentTab");
  const setCurrentTab = useThemeBrowserSharedAction("setCurrentTab");
  return (
    <div className="cl_fullscreenroute_container">
      <ThemeCardCSSVariableProvider />
      <Tabs
        activeTab={currentTab}
        onShowTab={(tab) => setCurrentTab(tab)}
        tabs={[
          {
            id: "bpm-themes",
            title: "BPM Themes",
            content: (
              <ThemeBrowserStoreProvider
                filterPath="/themes/filters"
                themePath="/themes"
                themeType="BPM"
                requiresAuth={false}
              >
                <ThemeBrowserPage />
              </ThemeBrowserStoreProvider>
            ),
          },
          {
            id: "desktop-themes",
            title: "Desktop Themes",
            content: (
              <ThemeBrowserStoreProvider
                filterPath="/themes/filters"
                themePath="/themes"
                themeType="DESKTOP"
                requiresAuth={false}
              >
                <ThemeBrowserPage />
              </ThemeBrowserStoreProvider>
            ),
          },
        ]}
      ></Tabs>
    </div>
  );
}
