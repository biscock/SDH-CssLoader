import {
  Flags,
  FullAccountData,
  MinimalCSSThemeInfo,
  Motd,
  Theme,
  ThemeError,
  UpdateStatus,
} from "../../types";
import { createStore } from "zustand";
import type { Backend } from "../services";
import { FetchError } from "../errors";

const apiUrl = "https://api.deckthemes.com";

export interface CSSLoaderStateValues {
  apiUrl: string;
  // Account Data
  apiShortToken: string;
  apiFullToken: string;
  apiMeData: FullAccountData | undefined;
  apiTokenExpireDate: number | undefined;

  // Theme Metadata
  updateStatuses: UpdateStatus[];
  nextUpdateCheckTime: number; // Unix time stamp;
  updateCheckTimeout: NodeJS.Timeout | undefined;
  unpinnedThemes: string[];
  isWorking: boolean;
  selectedPreset: Theme | undefined;
  themeRootPath: string;
  themeErrors: ThemeError[];
  themes: Theme[];

  // Plugin Settings
  dummyFunctionResult: boolean;
  backendVersion: number;
  motd: Motd | undefined;
  hiddenMotdId: string;
  serverState: boolean;
  watchState: boolean;
  translationsBranch: "-1" | "0" | "1";
  patrons: string[];
}

export interface CSSLoaderStateActions {
  initializeStore: () => Promise<void>;
  deactivate: () => void;
  toast: (message: string) => void;
  reloadPlugin: () => Promise<void>;
  reloadThemes: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
  apiFetch: <Return>(url: string, request?: RequestInit, options?: FetchOptions) => Promise<Return>;
  logInWithShortToken: (newToken?: string) => Promise<void>;
  logOut: () => void;
  getThemes: () => Promise<void>;
  changePreset: (presetName: string) => Promise<void>;
  testBackend: () => Promise<void>;
  bulkThemeUpdateCheck: () => Promise<void>;
  scheduleBulkThemeUpdateCheck: () => void;
  getMotd: () => Promise<void>;
  hideMotd: () => Promise<void>;
  regenerateCurrentPreset: () => Promise<void>;
  setPatchValue: (themeName: string, patchName: string, value: string) => Promise<void>;
  setComponentValue: (
    themeName: string,
    patchName: string,
    componentName: string,
    value: string
  ) => Promise<void>;
  installTheme: (themeId: string) => Promise<void>;
  toggleTheme: (
    theme: Theme,
    value: boolean,
    enableDeps?: boolean,
    enableDepValues?: boolean
  ) => Promise<void>;
  pinTheme: (themeId: string) => Promise<void>;
  unpinTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string, refreshAfter?: boolean) => Promise<void>;
  setTranslationBranch: (branch: "-1" | "0" | "1") => Promise<void>;
  setServerState: (state: boolean) => Promise<void>;
  setWatchState: (state: boolean) => Promise<void>;
}

export interface FetchOptions {
  requiresAuth?: boolean;
  customAuthToken?: string;
  responseMode?: "json" | "text" | "void";
}

export interface ICSSLoaderState extends CSSLoaderStateValues, CSSLoaderStateActions {}

export const createCSSLoaderStore = (backend: Backend) =>
  createStore<ICSSLoaderState>((set, get) => {
    async function apiFetch<Return>(
      fetchPath: string,
      request?: RequestInit,
      options?: FetchOptions
    ) {
      try {
        const { refreshToken } = get();
        let authToken = undefined;
        if (options?.requiresAuth) {
          authToken = options?.customAuthToken ?? (await refreshToken());
        }
        return await backend.fetch<Return>(
          `${apiUrl}${fetchPath}`,
          {
            method: "GET",
            ...request,
            headers: {
              ...(request?.headers || {}),
              Authorization: `Bearer ${authToken}`,
            },
          },
          options?.responseMode ?? "json"
        );
      } catch (error) {
        if (error instanceof FetchError) {
          throw error;
        }
        throw new FetchError("Fetch Failed", fetchPath, "Unknown Error");
      }
    }

    async function getPatrons() {
      try {
        const data = await apiFetch<string>(
          "/patrons",
          {},
          {
            responseMode: "text",
          }
        );
        if (data) {
          return data.split("\n");
        }
      } catch (error) {
        console.error("CSSLoader - Error Fetching Patrons", error);
      }
      return [];
    }

    return {
      apiUrl: apiUrl,
      // Account Data
      apiShortToken: "",
      apiFullToken: "",
      apiMeData: undefined,
      apiTokenExpireDate: undefined,

      // Theme Metadata
      updateStatuses: [],
      nextUpdateCheckTime: 0,
      updateCheckTimeout: undefined,
      isWorking: false,
      unpinnedThemes: [],
      selectedPreset: undefined,
      themeRootPath: "",
      themeErrors: [],
      themes: [],

      // Plugin Settings
      dummyFunctionResult: false,
      backendVersion: 9,
      motd: undefined,
      hiddenMotdId: "",
      serverState: false,
      watchState: false,
      // Not entirely sure why but unless I manually type this it errors
      translationsBranch: "-1" as "-1",
      patrons: [],

      initializeStore: async () => {
        try {
          const dummyFunctionResult = await backend.dummyFunction();
          set({ dummyFunctionResult });
          // If the backend doesn't work, no point in running the rest
          if (!dummyFunctionResult) return;

          const backendVersion = await backend.getBackendVersion();
          set({ backendVersion });

          const themes = (await backend.getThemes()) ?? [];
          set({
            themes,
            selectedPreset: themes.find((e) => e.flags.includes(Flags.isPreset) && e.enabled),
          });

          const themePath = await backend.fetchThemePath();
          set({ themeRootPath: themePath });

          console.log("HELLO TEST", await backend.getMappings());

          const unpinnedThemesStr = await backend.storeRead("unpinnedThemes");
          const unpinnedThemes: string[] = unpinnedThemesStr ? JSON.parse(unpinnedThemesStr) : [];
          const allThemeIds = themes.map((e) => e.id);
          // If a theme is in the unpinned store but no longer exists, remove it from the unpinned store
          let unpinnedClone = [...unpinnedThemes];
          unpinnedThemes.forEach((e) => {
            if (!allThemeIds.includes(e)) {
              unpinnedClone = unpinnedClone.filter((id) => id !== e);
            }
          });
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));

          const shortToken = await backend.storeRead("shortToken");
          set({ apiShortToken: shortToken ?? "" });
          const hiddenMotd = await backend.storeRead("hiddenMotd");
          set({ hiddenMotdId: hiddenMotd ?? "" });

          if (shortToken) {
            await get().logInWithShortToken();
          }

          const serverState = await backend.getServerState();
          const watchState = await backend.getWatchState();
          set({ serverState, watchState });
          const translationsBranch = await backend.storeRead("beta_translations");
          set({
            translationsBranch: ["-1", "0", "1"].includes(translationsBranch)
              ? (translationsBranch as "-1" | "0" | "1")
              : "-1",
          });

          const { bulkThemeUpdateCheck, scheduleBulkThemeUpdateCheck } = get();
          await bulkThemeUpdateCheck();
          scheduleBulkThemeUpdateCheck();

          const patrons = await getPatrons();
          set({ patrons });
        } catch (error) {
          console.log("CSSLoader - Error During Initialzation", error);
        }
      },
      deactivate: () => {
        const { updateCheckTimeout } = get();
        if (updateCheckTimeout) clearTimeout(updateCheckTimeout);
      },
      toast: (message: string) => {
        backend.toast("CSS Loader", message);
      },
      reloadPlugin: async () => {
        set({ isWorking: true });
        try {
          const { reloadThemes, initializeStore, bulkThemeUpdateCheck, dummyFunctionResult } =
            get();

          // If the dummy func result is false, the plugin never initialized properly anyway, so we should just re-initialize the whole thing.
          if (dummyFunctionResult === false) {
            await initializeStore();
          } else {
            // Otherwise, we can just reload the necessary stuff
            const dummyFunctionResult = await backend.dummyFunction();
            set({ dummyFunctionResult });
            await reloadThemes();
            await bulkThemeUpdateCheck();
          }
        } catch (error) {}
        set({ isWorking: false });
      },
      reloadThemes: async () => {
        try {
          await backend.reset();
          await get().getThemes();
        } catch (error) {
          console.error("CSSLoader - Error Reloading Themes", error);
        }
      },
      logInWithShortToken: async (newToken?: string) => {
        try {
          const token = newToken ?? get().apiShortToken;
          if (!token) {
            throw new Error("No Token Provided");
          }
          // This can't use apiFetch because it doesn't use header based auth
          const json = await backend.fetch<{ token: string }>(`${apiUrl}/auth/authenticate_token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
          if (!json.token) {
            throw new FetchError(
              "Token Authentication Failed",
              `${apiUrl}/auth/authenticate_token`,
              "No Token in Response"
            );
          }
          backend.storeWrite("shortToken", token);
          set({
            apiShortToken: token,
            apiFullToken: json.token,
            apiTokenExpireDate: new Date().valueOf() + 1000 * 10 * 60,
          });
          const meJson = await apiFetch<FullAccountData>("/auth/me", undefined, {
            requiresAuth: true,
          });
          if (meJson) {
            set({ apiMeData: meJson });
          }
        } catch (error) {
          backend.toast("CSSLoader", "Failed to log in");
        }
      },
      logOut: () => {
        set({
          apiShortToken: "",
          apiFullToken: "",
          apiMeData: undefined,
          apiTokenExpireDate: undefined,
        });
        backend.storeWrite("shortToken", "");
      },
      refreshToken: async (): Promise<string | undefined> => {
        const { apiFullToken, apiTokenExpireDate } = get();
        if (!apiFullToken) {
          return undefined;
        }
        if (apiTokenExpireDate === undefined || new Date().valueOf() < apiTokenExpireDate) {
          return apiFullToken;
        }
        try {
          const json = await backend.fetch<{ token: string }>(`${apiUrl}/auth/refresh_token`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiFullToken}`,
            },
          });

          if (!json.token) {
            throw new FetchError(
              "Token Refresh Failed",
              `${apiUrl}/auth/refresh_token`,
              "No Token in Response"
            );
          }
          set({
            apiFullToken: json.token,
            apiTokenExpireDate: new Date().valueOf() + 1000 * 10 * 60,
          });
          return json.token;
        } catch (error) {
          throw error;
        }
      },
      apiFetch: apiFetch,
      getThemes: async () => {
        try {
          const { fails: themeErrors } = await backend.getThemeErrors();
          set({ themeErrors });
          const themes = await backend.getThemes();
          set({
            themes,
            selectedPreset: themes.find((e) => e.flags.includes(Flags.isPreset) && e.enabled),
          });
        } catch (error) {
          console.error("CSSLoader - Error Fetching Themes", error);
        }
      },
      changePreset: async (presetName: string) => {
        try {
          const { selectedPreset, themes } = get();

          if (selectedPreset) {
            // If you already have a preset enabled, disabling the preset disables all of it's dependencies with it.
            await backend.setThemeState(selectedPreset.name, false);
          } else {
            // If you don't have a preset, you need to disable all currently enabled themes and THEN enable the preset
            await Promise.all(
              themes.filter((e) => e.enabled).map((e) => backend.setThemeState(e.name, false))
            );
          }
          // Actually enabling the preset itself
          if (presetName !== "None") {
            await backend.setThemeState(presetName, true);
          }
          await get().getThemes();
        } catch (error) {}
      },
      testBackend: async () => {
        try {
          const dummyFunctionResult = await backend.dummyFunction();
          set({ dummyFunctionResult });
        } catch (error) {
          set({ dummyFunctionResult: false });
        }
      },
      bulkThemeUpdateCheck: async () => {
        const { themes } = get();

        async function fetchThemeIDS(idsToQuery: string[]): Promise<MinimalCSSThemeInfo[]> {
          const queryStr = "?ids=" + idsToQuery.join(".");
          try {
            const value = await apiFetch<MinimalCSSThemeInfo[]>(`/themes/ids${queryStr}`);
            if (value) return value;
          } catch {}
          return [];
        }

        let idsToQuery: string[] = themes.map((e) => e.id);
        if (idsToQuery.length === 0) set({ updateStatuses: [] });

        const themeArr = await fetchThemeIDS(idsToQuery);

        if (themeArr.length === 0) set({ updateStatuses: [] });

        const updateStatusArr: UpdateStatus[] = themes.map((localEntry) => {
          const remoteEntry = themeArr.find(
            (remote) => remote.id === localEntry.id || remote.name === localEntry.id
          );
          if (!remoteEntry) {
            return [localEntry.id, "local", false];
          }
          if (remoteEntry.version === localEntry.version) {
            return [localEntry.id, "installed", remoteEntry];
          }
          return [localEntry.id, "outdated", remoteEntry];
        });
        set({ updateStatuses: updateStatusArr });
      },
      scheduleBulkThemeUpdateCheck: () => {
        function recursiveCheck() {
          const timeout = setTimeout(async () => {
            // Putting this in the function as im not sure the value would update otherwise
            const { nextUpdateCheckTime } = get();
            if (!(new Date().valueOf() > nextUpdateCheckTime)) {
              recursiveCheck();
              return;
            }
            // After testing, it appears that, if there is no wifi, bulkThemeUpdateCheck returns an empty array, this is okay, the try catch is just for extra safety
            try {
              const { bulkThemeUpdateCheck } = get();
              await bulkThemeUpdateCheck();

              set({ nextUpdateCheckTime: new Date().valueOf() + 24 * 60 * 60 * 1000 });
            } catch (err) {
              console.log("CSSLoader - Error Checking For Theme Updates", err);
            }
            recursiveCheck();
          }, 5 * 60 * 1000);
          set({ updateCheckTimeout: timeout });
        }
        set({ nextUpdateCheckTime: new Date().valueOf() + 24 * 60 * 60 * 1000 });
        recursiveCheck();
      },
      getMotd: async () => {
        try {
          const value = await apiFetch<Motd>("/motd");
          if (value) {
            set({ motd: value });
          }
        } catch (error) {}
      },
      hideMotd: async () => {
        try {
          const { motd } = get();
          if (!motd) return;
          await backend.storeWrite("hiddenMotd", motd.id);
          set({ hiddenMotdId: motd.id });
        } catch (error) {}
      },
      regenerateCurrentPreset: async () => {
        try {
          const { selectedPreset, themes } = get();
          if (!selectedPreset) return;
          await backend.generatePresetThemeFromThemeNames(
            selectedPreset.name,
            // This will handle if you just toggles/un-toggled a theme, as well as if you changed a patch/component
            themes.filter((e) => e.enabled && !e.flags.includes(Flags.isPreset)).map((e) => e.name)
          );
        } catch (error) {}
      },
      setPatchValue: async (themeName: string, patchName: string, value: string) => {
        try {
          await backend.setPatchOfTheme(themeName, patchName, value);
          const { selectedPreset, regenerateCurrentPreset } = get();
          if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
            await regenerateCurrentPreset();
          }
        } catch (error) {}
      },
      setComponentValue: async (
        themeName: string,
        patchName: string,
        componentName: string,
        value: string
      ) => {
        try {
          await backend.setComponentOfThemePatch(themeName, patchName, componentName, value);
          const { selectedPreset, regenerateCurrentPreset, getThemes } = get();
          if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
            await regenerateCurrentPreset();
          }
          // TODO: POTENTIALLY NOT NEEDED
          await getThemes();
        } catch (error) {}
      },
      installTheme: async (themeId: string) => {
        set({ isWorking: true });
        try {
          await backend.downloadThemeFromUrl(themeId, apiUrl);
          const { updateStatuses, reloadThemes } = get();
          await reloadThemes();
          const updateStatusesClone = updateStatuses.filter((e) => e[0] !== themeId);
          updateStatusesClone.push([themeId, "installed", false]);
          set({ updateStatuses: updateStatusesClone });
        } catch (error) {}
        set({ isWorking: false });
      },
      toggleTheme: async (
        theme: Theme,
        value: boolean,
        enableDeps?: boolean,
        enableDepValues?: boolean
      ) => {
        try {
          await backend.setThemeState(theme.name, value, enableDeps, enableDepValues);
          await get().getThemes();

          if (!enableDeps && theme.dependencies.length > 0) {
            if (value) {
              backend.toast(
                `${theme.display_name} enabled other themes`,
                `${theme.dependencies.length} other theme${
                  theme.dependencies.length === 1 ? " is" : "s are"
                } required by ${theme.display_name}`
              );
            } else if (!theme.flags.includes(Flags.dontDisableDeps)) {
              backend.toast(
                `${theme.display_name} disabled other themes`,
                `${theme.dependencies.length} other theme${
                  theme.dependencies.length === 1 ? " was" : "s were"
                } originally enabled by ${theme.display_name}`
              );
            }
          }
          const { selectedPreset } = get();
          if (selectedPreset) {
            await get().regenerateCurrentPreset();
            await get().getThemes();
          }
        } catch (error) {
          console.error("CSSLoader - Error Toggling Theme", error);
        }
      },
      pinTheme: async (themeId: string) => {
        try {
          const { unpinnedThemes } = get();
          const unpinnedClone = unpinnedThemes.filter((e) => e !== themeId);
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));
        } catch (error) {}
      },
      unpinTheme: async (themeId: string) => {
        try {
          const { unpinnedThemes } = get();
          const unpinnedClone = [...unpinnedThemes, themeId];
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));
        } catch (error) {}
      },
      deleteTheme: async (themeId: string, refreshAfter: boolean = true) => {
        set({ isWorking: true });
        try {
          const { themes, unpinnedThemes, updateStatuses } = get();
          // The python defs say theme name, just gonna assume it's this and not ID
          const themeName = themes.find((e) => e.id === themeId)?.name;
          if (!themeName) return;
          await backend.deleteTheme(themeName);

          // This doesn't actually 'pin' the theme, it just removes it from the unpinned list so that if it's ever reinstalled it isn't hidden
          if (unpinnedThemes.includes(themeId)) {
            get().pinTheme(themeId);
          }

          set({ updateStatuses: updateStatuses.filter((e) => e[0] !== themeId) });

          refreshAfter && (await get().getThemes());
        } catch (error) {}
        set({ isWorking: false });
      },
      setTranslationBranch: async (branch: "-1" | "0" | "1") => {
        try {
          await backend.storeWrite("beta_translations", branch);
          const newValue = await backend.storeRead("beta_translations");
          set({
            translationsBranch: ["-1", "0", "1"].includes(newValue)
              ? (newValue as "-1" | "0" | "1")
              : "-1",
          });
        } catch (error) {}
      },
      setServerState: async (state: boolean) => {
        try {
          if (state) {
            await backend.enableServer();
          }
          await backend.storeWrite("server", state ? "1" : "0");
          const newValue = await backend.getServerState();
          set({ serverState: newValue });
        } catch (error) {}
      },
      setWatchState: async (state: boolean) => {
        try {
          await backend.toggleWatchState(state, false);
          const newValue = await backend.getWatchState();
          set({ watchState: newValue });
        } catch (error) {}
      },
    };
  });
