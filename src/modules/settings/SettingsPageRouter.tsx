import { SidebarNavigation } from "@decky/ui";
import { FaFolder, FaGear, FaGithub, FaHeart, FaPaintRoller } from "react-icons/fa6";
import { CreditsPage } from "./credits";
import { DonatePage } from "./donate/DonatePage";
import { PluginSettingsPage } from "./plugin";
import { ProfileSettings } from "./profile";
import { ThemeSettings, ThemeSettingsPage } from "./theme";

export function SettingsPageRouter() {
  return (
    <SidebarNavigation
      pages={[
        {
          title: "Themes",
          icon: <FaPaintRoller />,
          route: "/cssloader/settings/themes",
          content: <ThemeSettingsPage />,
        },
        {
          title: "Profiles",
          icon: <FaFolder />,
          route: "/cssloader/settings/profiles",
          content: <ProfileSettings />,
        },
        {
          title: "Settings",
          icon: <FaGear />,
          route: "/cssloader/settings/plugin",
          content: <PluginSettingsPage />,
        },
        {
          title: "Donate",
          icon: <FaHeart />,
          route: "/cssloader/settings/donate",
          content: <DonatePage />,
        },
        {
          title: "Credits",
          icon: <FaGithub />,
          route: "/cssloader/settings/credits",
          content: <CreditsPage />,
        },
      ]}
    />
  );
}
