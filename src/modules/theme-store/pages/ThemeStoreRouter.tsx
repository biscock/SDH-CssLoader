import { Tabs } from "@decky/ui";
import { ThemeBrowserPage } from "../components";
import {
  ThemeBrowserStoreProvider,
  useThemeBrowserSharedAction,
  useThemeBrowserSharedValue,
} from "../context";
import { AccountPage } from "./AccountPage";
import { useCSSLoaderValue } from "@/backend";
import { Permissions } from "@/types";
import { ThemeCardCSSVariableProvider } from "@/lib";

// TODO: Make the tab definition a constant so that it isn't re-generated every page load

export function ThemeStoreRouter() {
  const currentTab = useThemeBrowserSharedValue("currentTab");
  const setCurrentTab = useThemeBrowserSharedAction("setCurrentTab");

  const apiMeData = useCSSLoaderValue("apiMeData");

  const tabs = [
    {
      id: "bpm-themes",
      title: "Deck UI Themes",
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
    {
      id: "account",
      title: "Account",
      content: <AccountPage />,
    },
  ];

  apiMeData?.permissions?.includes(Permissions.viewSubs) &&
    tabs.splice(2, 0, {
      id: "submissions",
      title: "Submissions",
      content: (
        <ThemeBrowserStoreProvider
          filterPath="/themes/awaiting_approval/filters"
          themePath="/themes/awaiting_approval"
          themeType="ALL"
          requiresAuth={true}
        >
          <ThemeBrowserPage />
        </ThemeBrowserStoreProvider>
      ),
    });

  apiMeData?.username &&
    tabs.splice(2, 0, {
      id: "starred-themes",
      title: "Starred Themes",
      content: (
        <ThemeBrowserStoreProvider
          filterPath="/users/me/stars/filters"
          themePath="/users/me/stars"
          themeType="ALL"
          requiresAuth={true}
        >
          <ThemeBrowserPage />
        </ThemeBrowserStoreProvider>
      ),
    });

  return (
    <div className="cl_fullscreenroute_container">
      <BrowserCardSizeVariableProvider />
      <Tabs
        activeTab={currentTab}
        onShowTab={(tab: string) => {
          console.log("Setting tab", tab);
          setCurrentTab(tab);
        }}
        tabs={tabs}
      />
    </div>
  );
}

function BrowserCardSizeVariableProvider() {
  const browserCardSize = useThemeBrowserSharedValue("browserCardSize");

  return <ThemeCardCSSVariableProvider cardSize={browserCardSize} />;
}
