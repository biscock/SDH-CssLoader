// This is for things that are shared across the entire Theme Browser page and all tabs.

import { createStore } from "zustand";
import { generateStoreSelector } from "zusteebles";
import { ColumnNumbers } from "../../../lib/components/theme-card";

export const THEME_STORE_FIRST_TAB_ID = "bpm-themes";

interface ThemeBrowserSharedStoreValues {
  browserCardSize: ColumnNumbers;
  currentTab: string;
  targetOverride: string | null;
  /** When true, theme store route will not reset tab to first (e.g. when returning from expanded view). */
  skipNextTabReset: boolean;
}

interface ThemeBrowserSharedStoreActions {
  setBrowserCardSize: (value: ColumnNumbers) => void;
  setCurrentTab: (value: string) => void;
  setTargetOverride: (value: string | null) => void;
  setSkipNextTabReset: (value: boolean) => void;
}

interface IThemeBrowserSharedStore
  extends ThemeBrowserSharedStoreValues,
    ThemeBrowserSharedStoreActions {}

export const themeBrowserSharedStore = createStore<IThemeBrowserSharedStore>((set) => {
  return {
    browserCardSize: 3,
    currentTab: THEME_STORE_FIRST_TAB_ID,
    targetOverride: "",
    skipNextTabReset: false,
    setBrowserCardSize: (value: ColumnNumbers) => set({ browserCardSize: value }),
    setCurrentTab: (value: string) => set({ currentTab: value }),
    setTargetOverride: (value: string | null) => set({ targetOverride: value }),
    setSkipNextTabReset: (value: boolean) => set({ skipNextTabReset: value }),
  };
});

export const getThemeBrowserSharedState = () => themeBrowserSharedStore.getState();

export const useThemeBrowserSharedValues =
  generateStoreSelector<ThemeBrowserSharedStoreValues>(themeBrowserSharedStore);
export const useThemeBrowserSharedActions =
  generateStoreSelector<ThemeBrowserSharedStoreActions>(themeBrowserSharedStore);
