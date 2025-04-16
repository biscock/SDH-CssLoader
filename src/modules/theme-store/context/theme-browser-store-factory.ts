import { getCSSLoaderState } from "@/backend";
import {
  FilterQueryResponse,
  PartialCSSThemeInfo,
  ThemeQueryRequest,
  ThemeQueryResponse,
} from "@/types";
import { isEqual } from "lodash";
import { createStore } from "zustand";
import { getThemeBrowserSharedState, themeBrowserSharedStore } from "./theme-browser-shared-store";

export interface ThemeBrowserStoreValues {
  isInitialized: boolean;
  loading: boolean;
  themes: PartialCSSThemeInfo[];
  themeTotal: number;
  searchOpts: ThemeQueryRequest;
  prevSearchOpts: ThemeQueryRequest;
  filterOptions: FilterQueryResponse;
  indexToSnapToOnLoad: number;
}

export interface ThemeBrowserStoreActions {
  initializeStore: () => Promise<void>;
  getFilters: () => Promise<void>;
  setSearchOpts: (searchOpts: ThemeQueryRequest, forceRefresh?: boolean) => Promise<void>;
  refreshThemes: () => Promise<void>;
  getThemes: () => Promise<void>;
}

export interface IThemeBrowserStore extends ThemeBrowserStoreValues, ThemeBrowserStoreActions {}

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

export function generateThemeBrowserStore({
  filterPath,
  themePath,
  themeType,
  requiresAuth = false,
}: {
  filterPath: string;
  themePath: string;
  themeType: "ALL" | "DESKTOP" | "BPM";
  requiresAuth?: boolean;
}) {
  const store = createStore<IThemeBrowserStore>((set, get) => ({
    isInitialized: false,
    loading: true,
    themes: [],
    themeTotal: 0,
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

        // When you navigate to the expanded view and back, it re-loads the page, which re-runs this, so we can just check if there is a target override
        const { targetOverride } = getThemeBrowserSharedState();
        if (targetOverride) {
          get().setSearchOpts(
            {
              ...get().searchOpts,
              filters: targetOverride,
              page: 1,
            },
            true
          );
          themeBrowserSharedStore.setState({ targetOverride: null });
        } else {
          await get().getThemes();
        }
        set({ isInitialized: true });
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
          {
            requiresAuth,
          }
        );
        if (response.filters) {
          set({ filterOptions: response });
        }
      } catch (error) {}
    },
    setSearchOpts: async (searchOpts, forceRefresh?: boolean) => {
      const { searchOpts: prevSearchOpts, themes, getThemes } = get();
      set({ searchOpts, prevSearchOpts });

      if (!isEqual(prevSearchOpts, searchOpts) || forceRefresh || themes.length === 0) {
        await getThemes();
      }
    },
    refreshThemes: async () => {
      // setSearchOpts calls get
      const { searchOpts, setSearchOpts } = get();
      await setSearchOpts({ ...searchOpts, page: 1 }, true);
    },
    getThemes: async () => {
      set({ loading: true });
      try {
        const { searchOpts } = get();

        const { apiFetch } = getCSSLoaderState();
        const response = await apiFetch<ThemeQueryResponse>(
          `${themePath}?${generateParamStr(searchOpts, themeType)}`,
          {},
          {
            requiresAuth,
          }
        );
        if (response.items) {
          set({ themeTotal: response.total });
          if (searchOpts.page === 1) {
            set({ themes: response.items, indexToSnapToOnLoad: -1 });
          } else {
            set({
              themes: [...get().themes, ...response.items],
              // This ensures that you snap back to the last theme you were viewing
              // For example, if you were at the end of page 1 (theme 50) and you load page 2, you should snap back to theme 50
              indexToSnapToOnLoad: searchOpts.perPage * (searchOpts.page - 1) - 1,
            });
          }
        }
      } catch (error) {}
      set({ loading: false });
    },
  }));

  let prevTargetOverride: string | null = null;
  themeBrowserSharedStore.subscribe((state) => {
    if (state.targetOverride !== prevTargetOverride) {
      prevTargetOverride = state.targetOverride;
      if (state.targetOverride) {
        store.getState().setSearchOpts(
          {
            ...store.getState().searchOpts,
            filters: state.targetOverride,
            page: 1,
          },
          true
        );
        themeBrowserSharedStore.setState({ targetOverride: null });
      }
    }
  });

  return store;
}
