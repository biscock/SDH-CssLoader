import { createContext, useRef } from "react";
import { createStore, StoreApi } from "zustand";
import { generateStoreSelectorFromContext } from "zusteebles";
import {
  generateThemeBrowserStore,
  IThemeBrowserStore,
  ThemeBrowserStoreActions,
  ThemeBrowserStoreValues,
} from "./theme-browser-store-factory";

const ThemeBrowserPersistenceStore = createStore<
  Record<string, StoreApi<IThemeBrowserStore> | undefined>
>(() => ({}));

const ThemeBrowserStoreContext = createContext<StoreApi<IThemeBrowserStore> | null>(null);

// Each store is essentially the same thing, so we use a Context so that we can just put a provider for each page
// However, when you change tabs and come back (which would delete and recreate the provider), the state shouldn't reset
// So we use the ThemeBrowserPersistenceStore to hold the old copies of the stores so that if the component is recreated it can pick up where it left off
export function ThemeBrowserStoreProvider({
  pageId,
  children,
  filterPath,
  themePath,
  themeType,
  requiresAuth = false,
}: {
  pageId: string;
  children: React.ReactNode;
  filterPath: string;
  themePath: string;
  themeType: "ALL" | "DESKTOP" | "BPM" | "PROFILE";
  requiresAuth?: boolean;
}) {
  const storeRef = useRef<StoreApi<IThemeBrowserStore> | null>(null);

  if (!storeRef.current) {
    let store: StoreApi<IThemeBrowserStore>;
    const existingStore = ThemeBrowserPersistenceStore.getState()[pageId];

    if (existingStore) {
      store = existingStore;
    } else {
      store = generateThemeBrowserStore({
        filterPath,
        themePath,
        themeType,
        requiresAuth,
      });
      ThemeBrowserPersistenceStore.setState((state) => ({
        ...state,
        [pageId]: store,
      }));
    }

    storeRef.current = store;
  }

  return (
    <ThemeBrowserStoreContext.Provider value={storeRef.current}>
      {children}
    </ThemeBrowserStoreContext.Provider>
  );
}

export const useThemeBrowserStoreValues =
  // @ts-expect-error I have no idea why this typing doesn't work
  generateStoreSelectorFromContext<ThemeBrowserStoreValues>(ThemeBrowserStoreContext);
export const useThemeBrowserStoreActions =
  // @ts-expect-error I have no idea why this typing doesn't work
  generateStoreSelectorFromContext<ThemeBrowserStoreActions>(ThemeBrowserStoreContext);
