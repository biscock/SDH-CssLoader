import { useCSSLoaderValues } from "@/backend";
import { ThemeCardCSSVariableProvider } from "@/lib";
import { Permissions } from "@/types";
import { Tabs } from "@decky/ui";
import { ThemeBrowserPage } from "../components";
import {
  ThemeBrowserStoreProvider,
  useThemeBrowserSharedActions,
  useThemeBrowserSharedValues,
} from "../context";
import { AccountPage } from "./AccountPage";

// TODO: Make the tab definition a constant so that it isn't re-generated every page load

export function ThemeStoreRouter() {
  const { currentTab } = useThemeBrowserSharedValues();
  const { setCurrentTab } = useThemeBrowserSharedActions();

  const { apiMeData } = useCSSLoaderValues();

  const tabs = [
    {
      id: "bpm-themes",
      title: "Deck UI Themes",
      content: (
        <ThemeBrowserStoreProvider
          pageId="bpm-themes"
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
          pageId="desktop-themes"
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
          pageId="submissions"
          filterPath="/submissions/filters"
          themePath="/submissions"
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
          pageId="starred-themes"
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
          setCurrentTab(tab);
        }}
        tabs={tabs}
      />
    </div>
  );
}

function BrowserCardSizeVariableProvider() {
  const { browserCardSize } = useThemeBrowserSharedValues();

  return <ThemeCardCSSVariableProvider cardSize={browserCardSize} />;
}
