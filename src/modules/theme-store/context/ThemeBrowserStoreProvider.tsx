import { createContext, useContext, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";
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
  themeType: "ALL" | "DESKTOP" | "BPM";
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

export const useThemeBrowserStore = <T,>(selector: (state: IThemeBrowserStore) => T) => {
  const store = useContext(ThemeBrowserStoreContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return useStore(store, selector);
};
export const useThemeBrowserStoreValue = <T extends keyof ThemeBrowserStoreValues>(
  key: T
): IThemeBrowserStore[T] => useThemeBrowserStore((state) => state[key]);

export const useThemeBrowserStoreAction = <T extends keyof ThemeBrowserStoreActions>(
  key: T
): IThemeBrowserStore[T] => useThemeBrowserStore((state) => state[key]);
