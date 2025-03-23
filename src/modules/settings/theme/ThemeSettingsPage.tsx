import { useCSSLoaderValues } from "@/backend";
import { ThemeErrorCard } from "@/lib";
import { Flags } from "@/types";
import { DialogButton, Focusable } from "@decky/ui";
import { useMemo, useState } from "react";
import { ThemeDeleteMenu } from "./ThemeDeleteMenu";
import { ThemeSettingsEntry } from "./ThemeSettingsEntry";
import { UpdateAllThemesButton } from "./UpdateAllThemesButton";

export function ThemeSettingsPage() {
  const [deleteMode, setDeleteMode] = useState(false);
  const { themes, unpinnedThemes, themeErrors } = useCSSLoaderValues();

  // This sorts the themes as pinned first, then unpinned, but it freezes it so that if you pin a theme the list doesn't jump around
  const sortedList = useMemo(() => {
    return themes
      .filter((e) => !e.flags.includes(Flags.isPreset))
      .sort((a, b) => {
        const aPinned = !unpinnedThemes.includes(a.id);
        const bPinned = !unpinnedThemes.includes(b.id);
        if (aPinned === bPinned) {
          return a.name.localeCompare(b.name);
        }
        return Number(bPinned) - Number(aPinned);
      });
  }, [themes.length]);

  return (
    <Focusable className="cl_settingspage_container">
      <Focusable className="!flex !gap-4 !mb-4">
        <DialogButton
          className="CSSLoader_InstalledThemes_ModeButton"
          onClick={() => setDeleteMode(!deleteMode)}
        >
          {deleteMode ? "Go Back" : "Delete Themes"}
        </DialogButton>
        <UpdateAllThemesButton />
      </Focusable>
      {deleteMode ? (
        <ThemeDeleteMenu sortedThemeList={sortedList} onLeave={() => setDeleteMode(false)} />
      ) : (
        <Focusable className="!flex !flex-col !gap-1">
          {sortedList.map((theme) => (
            <ThemeSettingsEntry key={theme.id} theme={theme} />
          ))}
        </Focusable>
      )}
      {themeErrors.length > 0 && (
        <Focusable>
          <span className="text-2xl font-bold">Theme Errors</span>
          <Focusable className="!grid !grid-cols-2 !gap-4">
            {themeErrors.map((e) => (
              <ThemeErrorCard key={e[0]} error={e} />
            ))}
          </Focusable>
        </Focusable>
      )}
    </Focusable>
  );
}
