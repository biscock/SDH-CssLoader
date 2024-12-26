import { createContext, useContext, useRef } from "react";
import { FilterQueryResponse, ThemeQueryRequest, ThemeQueryResponse } from "@/types";
import { StoreApi, createStore, useStore } from "zustand";
import { getCSSLoaderState } from "@/backend";
import { isEqual } from "lodash";
import { getThemeBrowserSharedState, themeBrowserSharedStore } from "./ThemeBrowserSharedStore";

interface ThemeBrowserStoreValues {
  loading: boolean;
  themes: ThemeQueryResponse;
  searchOpts: ThemeQueryRequest;
  prevSearchOpts: ThemeQueryRequest;
  filterOptions: FilterQueryResponse;
  indexToSnapToOnLoad: number;
}

interface ThemeBrowserStoreActions {
  initializeStore: () => Promise<void>;
  getFilters: () => Promise<void>;
  setSearchOpts: (searchOpts: ThemeQueryRequest) => void;
  refreshThemes: () => Promise<void>;
  getThemes: () => Promise<void>;
}

interface IThemeBrowserStore extends ThemeBrowserStoreValues, ThemeBrowserStoreActions {}

const ThemeBrowserStoreContext = createContext<StoreApi<IThemeBrowserStore> | null>(null);

function generateParamStr(searchOpts: ThemeQueryRequest, themeType: "ALL" | "DESKTOP" | "BPM") {
  const searchOptsClone = structuredClone(searchOpts);

  let prependString =
    themeType === "ALL" ? "CSS" : themeType === "DESKTOP" ? "DESKTOP-CSS" : "BPM-CSS";
  // "All" is a fake term made up by the frontend to have a unique key for it, the server just expects empty
  searchOptsClone.filters === "All" ? (searchOptsClone.filters = "") : (prependString += ".");
  searchOptsClone.filters = prependString + searchOptsClone.filters;

  // @ts-expect-error
  const paramStr = new URLSearchParams(searchOptsClone).toString();
  return paramStr;
}

export function ThemeBrowserStoreProvider({
  children,
  filterPath,
  themePath,
  themeType,
  requiresAuth = false,
}: {
  children: React.ReactNode;
  filterPath: string;
  themePath: string;
  themeType: "ALL" | "DESKTOP" | "BPM";
  requiresAuth?: boolean;
}) {
  const storeRef = useRef<StoreApi<IThemeBrowserStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore<IThemeBrowserStore>((set, get) => ({
      loading: true,
      themes: { total: 0, items: [] },
      searchOpts: {
        page: 1,
        perPage: 50,
        filters: "All",
        order: "Last Updated",
        search: "",
      },
      prevSearchOpts: {
        page: 1,
        perPage: 50,
        filters: "All",
        order: "Last Updated",
        search: "",
      },
      filterOptions: {
        filters: [],
        order: ["Last Updated"],
      },
      indexToSnapToOnLoad: -1,
      initializeStore: async () => {
        try {
          await get().getFilters();
          await get().getThemes();

          // This ensures that it actually fetches new themed when you click on a forced target
          themeBrowserSharedStore.subscribe((state, prevState) => {
            if (state.targetOverride !== prevState.targetOverride) {
              get().getThemes();
            }
          });
        } catch (error) {}
      },
      getFilters: async () => {
        const { apiFetch } = getCSSLoaderState();
        const typeMapping = {
          ALL: "CSS",
          DESKTOP: "DESKTOP-CSS",
          BPM: "BPM-CSS",
        };

        try {
          const response = await apiFetch<FilterQueryResponse>(
            `${filterPath}?type=${typeMapping[themeType]}`,
            {},
            requiresAuth
          );
          if (response.filters) {
            set({ filterOptions: response });
          }
        } catch (error) {}
      },
      setSearchOpts(searchOpts) {
        const { searchOpts: prevSearchOpts, themes, getThemes } = get();
        set({ searchOpts, prevSearchOpts });

        if (!isEqual(prevSearchOpts, searchOpts) || themes.total === 0) {
          getThemes();
        }
      },
      refreshThemes: async () => {
        const { getThemes } = get();
        await getThemes();
      },
      getThemes: async () => {
        set({ loading: true });
        try {
          const { searchOpts } = get();
          const { targetOverride } = getThemeBrowserSharedState();
          const formattedSearchOpts = { ...searchOpts };
          targetOverride && (formattedSearchOpts.filters = targetOverride);

          const { apiFetch } = getCSSLoaderState();
          const response = await apiFetch<ThemeQueryResponse>(
            `${themePath}?${generateParamStr(formattedSearchOpts, themeType)}`,
            {},
            requiresAuth
          );
          if (response.items) {
            set({ themes: response, indexToSnapToOnLoad: -1 });
          }
        } catch (error) {}
        set({ loading: false });
      },
    }));
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
