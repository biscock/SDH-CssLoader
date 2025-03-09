// This is for things that are shared across the entire Theme Browser page and all tabs.

import { generateStoreSelector } from "@zusteebles";
import { createStore } from "zustand";
import { ColumnNumbers } from "../../../lib/components/theme-card";

interface ThemeBrowserSharedStoreValues {
  browserCardSize: ColumnNumbers;
  currentTab: string;
  targetOverride: string | null;
}

interface ThemeBrowserSharedStoreActions {
  setBrowserCardSize: (value: ColumnNumbers) => void;
  setCurrentTab: (value: string) => void;
  setTargetOverride: (value: string | null) => void;
}

interface IThemeBrowserSharedStore
  extends ThemeBrowserSharedStoreValues,
    ThemeBrowserSharedStoreActions {}

export const themeBrowserSharedStore = createStore<IThemeBrowserSharedStore>((set) => {
  return {
    browserCardSize: 3,
    currentTab: "bpm-themes",
    targetOverride: "",
    setBrowserCardSize: (value: ColumnNumbers) => set({ browserCardSize: value }),
    setCurrentTab: (value: string) => set({ currentTab: value }),
    setTargetOverride: (value: string | null) => set({ targetOverride: value }),
  };
});

export const getThemeBrowserSharedState = () => themeBrowserSharedStore.getState();

export const useThemeBrowserSharedValues =
  generateStoreSelector<ThemeBrowserSharedStoreValues>(themeBrowserSharedStore);
export const useThemeBrowserSharedActions =
  generateStoreSelector<ThemeBrowserSharedStoreActions>(themeBrowserSharedStore);
