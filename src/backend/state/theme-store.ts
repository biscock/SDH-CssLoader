import { sleep } from "@decky/ui";
import { createStore } from "zustand";
import {
  Flags,
  FullAccountData,
  MinimalCSSThemeInfo,
  Motd,
  PartialCSSThemeInfo,
  TaskQueryResponse,
  Theme,
  ThemeError,
  ThemeQueryResponse,
  UpdateStatus,
} from "../../types";
import { FetchError } from "../errors";
import type { Backend } from "../services";

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
  mappingsVersionStr: string;
  motd: Motd | undefined;
  hiddenMotdId: string;
  serverState: boolean;
  watchState: boolean;
  translationsBranch: "-1" | "0" | "1";
  patrons: string[];
}

export interface CSSLoaderStateActions {
  // Store utils
  initializeStore: () => Promise<void>;
  deactivate: () => void;

  // Basic functions
  reloadPlugin: () => Promise<void>;
  testBackend: () => Promise<void>;
  toast: (message: string) => void;
  apiFetch: <Return>(url: string, request?: RequestInit, options?: FetchOptions) => Promise<Return>;

  // Theme actions
  reloadThemes: () => Promise<void>;
  getThemes: () => Promise<void>;
  setPatchValue: (themeName: string, patchName: string, value: string) => Promise<void>;
  setComponentValue: (
    themeName: string,
    patchName: string,
    componentName: string,
    value: string
  ) => Promise<void>;
  toggleTheme: (
    theme: Theme,
    value: boolean,
    enableDeps?: boolean,
    enableDepValues?: boolean
  ) => Promise<void>;
  pinTheme: (themeId: string) => Promise<void>;
  unpinTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string, refreshAfter?: boolean) => Promise<void>;

  // Profile actions
  changePreset: (presetName: string) => Promise<void>;
  regenerateCurrentPreset: () => Promise<void>;
  createPreset: (presetName: string) => Promise<void>;

  // Account actions
  refreshToken: () => Promise<string | undefined>;
  logInWithShortToken: (newToken?: string) => Promise<void>;
  logOut: () => void;

  // Theme store actions
  bulkThemeUpdateCheck: () => Promise<void>;
  scheduleBulkThemeUpdateCheck: () => void;
  installTheme: (themeId: string) => Promise<void>;

  // Other api methods
  getMotd: () => Promise<void>;
  hideMotd: () => Promise<void>;
  getUploadedThemes: () => Promise<PartialCSSThemeInfo[]>;
  publishProfile: (
    profileName: string,
    isPublic: boolean,
    description?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Settings related actions
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
      mappingsVersionStr: "",
      backendVersion: 9,
      motd: undefined,
      hiddenMotdId: "",
      serverState: false,
      watchState: false,
      // Not entirely sure why but unless I manually type this it errors
      translationsBranch: "-1" as "-1",
      patrons: [],

      // MARK: Store utils
      async initializeStore() {
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
          const mappingsVersionStr = await backend.getMappingsVersion();
          set({ mappingsVersionStr });

          const { bulkThemeUpdateCheck, scheduleBulkThemeUpdateCheck } = get();
          await bulkThemeUpdateCheck();
          scheduleBulkThemeUpdateCheck();

          const patrons = await getPatrons();
          set({ patrons });
        } catch (error) {
          console.log("CSSLoader - Error During Initialzation", error);
        }
      },
      deactivate() {
        const { updateCheckTimeout } = get();
        if (updateCheckTimeout) clearTimeout(updateCheckTimeout);
      },

      // MARK: Basic functions
      async reloadPlugin() {
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
            const mappingsVersionStr = await backend.getMappingsVersion();
            set({ mappingsVersionStr });
          }
        } catch (error) {}
        set({ isWorking: false });
      },
      async testBackend() {
        try {
          const dummyFunctionResult = await backend.dummyFunction();
          set({ dummyFunctionResult });
        } catch (error) {
          set({ dummyFunctionResult: false });
        }
      },
      toast(message: string) {
        backend.toast("CSS Loader", message);
      },
      apiFetch: apiFetch,

      // MARK: Theme actions
      async reloadThemes() {
        try {
          await backend.reset();
          await get().getThemes();
        } catch (error) {
          console.error("CSSLoader - Error Reloading Themes", error);
        }
      },
      async getThemes() {
        try {
          const { fails: themeErrors } = await backend.getThemeErrors();
          set({ themeErrors });
          console.log("GET THEMES");
          const themes = await backend.getThemes();
          console.log(get().themes, themes);
          set({
            themes,
            selectedPreset: themes.find((e) => e.flags.includes(Flags.isPreset) && e.enabled),
          });
        } catch (error) {
          console.error("CSSLoader - Error Fetching Themes", error);
        }
      },
      async setPatchValue(themeName: string, patchName: string, value: string) {
        try {
          await backend.setPatchOfTheme(themeName, patchName, value);
          const { selectedPreset, regenerateCurrentPreset } = get();
          if (selectedPreset && selectedPreset.dependencies.includes(themeName)) {
            await regenerateCurrentPreset();
          }
        } catch (error) {}
      },
      async setComponentValue(
        themeName: string,
        patchName: string,
        componentName: string,
        value: string
      ) {
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
      async toggleTheme(
        theme: Theme,
        value: boolean,
        enableDeps?: boolean,
        enableDepValues?: boolean
      ) {
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
      async pinTheme(themeId: string) {
        try {
          const { unpinnedThemes } = get();
          const unpinnedClone = unpinnedThemes.filter((e) => e !== themeId);
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));
        } catch (error) {}
      },
      async unpinTheme(themeId: string) {
        try {
          const { unpinnedThemes } = get();
          const unpinnedClone = [...unpinnedThemes, themeId];
          set({ unpinnedThemes: unpinnedClone });
          backend.storeWrite("unpinnedThemes", JSON.stringify(unpinnedClone));
        } catch (error) {}
      },
      async deleteTheme(themeId: string, refreshAfter: boolean = true) {
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

      // MARK: Profile actions
      async changePreset(presetName: string) {
        try {
          const { selectedPreset, themes } = get();

          if (selectedPreset) {
            // If you already have a preset enabled, disabling the preset disables all of it's dependencies with it.
            await backend.setThemeState(selectedPreset.name, false);
          } else {
            // If you don't have a preset, you need to disable all currently enabled themes and THEN enable the preset
            await Promise.allSettled(
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
      async regenerateCurrentPreset() {
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
      async createPreset(presetName: string) {
        try {
          if (presetName.length === 0) return;
          await backend.generatePreset(presetName);
          await get().reloadThemes();
          await get().changePreset(presetName + ".profile");
          const updateStatusesClone = get().updateStatuses;
          set({
            updateStatuses: [...updateStatusesClone, [presetName + ".profile", "local", false]],
          });
        } catch {}
      },

      // MARK: Account actions
      async refreshToken() {
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
      async logInWithShortToken(newToken?: string) {
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
          const meJson = await apiFetch<FullAccountData>("/auth/me_full", undefined, {
            requiresAuth: true,
          });
          if (meJson) {
            set({ apiMeData: meJson });
          }
        } catch (error) {
          backend.toast("CSSLoader", "Failed to log in");
        }
      },
      logOut() {
        set({
          apiShortToken: "",
          apiFullToken: "",
          apiMeData: undefined,
          apiTokenExpireDate: undefined,
        });
        backend.storeWrite("shortToken", "");
      },

      // MARK: Theme store actions
      async bulkThemeUpdateCheck() {
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
      scheduleBulkThemeUpdateCheck() {
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
      async installTheme(themeId: string) {
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

      // MARK: Other api methods
      async getMotd() {
        try {
          // This 404s if there is no MOTD so the try catch is fine
          const value = await apiFetch<Motd>("/motd");
          if (value) {
            set({ motd: value });
          }
        } catch (error) {}
      },
      async hideMotd() {
        try {
          const { motd } = get();
          if (!motd) return;
          await backend.storeWrite("hiddenMotd", motd.id);
          set({ hiddenMotdId: motd.id });
        } catch (error) {}
      },
      async getUploadedThemes() {
        try {
          if (!get().apiShortToken) {
            return [];
          }
          const publicThemesRes = await apiFetch<ThemeQueryResponse>(
            "/users/me/themes?filters=CSS",
            {},
            { requiresAuth: true }
          );
          const privateThemesRes = await apiFetch<ThemeQueryResponse>(
            "/users/me/themes/private?filters=CSS",
            {},
            { requiresAuth: true }
          );
          return [...publicThemesRes.items, ...privateThemesRes.items].sort((a, b) => {
            const dateA = new Date(a.updated);
            const dateB = new Date(b.updated);
            return dateB.getTime() - dateA.getTime();
          });
        } catch {
          return [];
        }
      },
      async publishProfile(profileName: string, isPublic: boolean, description?: string) {
        try {
          if (!get().themes.some((e) => e.name === profileName)) {
            throw new Error("Profile not found");
          }
          const refreshedToken = await get().refreshToken();
          if (!refreshedToken) {
            throw new Error("Couldn't refresh auth token");
          }

          const blobRes = await backend.uploadThemeBlob(profileName, apiUrl, refreshedToken);
          if (!blobRes?.success) {
            throw new Error("Failed to upload blob");
          }

          const submissionRes = await apiFetch<{ task: string }>(
            "/submissions/css_zip",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                blob: blobRes.message.id,
                meta: {
                  imageBlobs: [],
                  description: description,
                  privateSubmission: !isPublic,
                },
              }),
            },
            { requiresAuth: true }
          );

          if (!submissionRes?.task) {
            throw new Error("No task returned");
          }

          let taskResult = null;
          while (!taskResult) {
            const currentTaskStatus = await apiFetch<TaskQueryResponse>(
              `/tasks/${submissionRes.task}`,
              {},
              { requiresAuth: true }
            );
            if (currentTaskStatus?.status === "complete") {
              taskResult = currentTaskStatus;
            } else if (currentTaskStatus?.status === "failed") {
              throw new Error(`Submission failed, ${currentTaskStatus?.status}`);
            } else {
              await sleep(1000);
            }
          }

          return {
            success: true,
            message: taskResult.status,
          };
        } catch (error) {
          if (error instanceof FetchError) {
            return {
              success: false,
              message: JSON.stringify(error.getError()),
            };
          }
          if (error instanceof Error) {
            return {
              success: false,
              message: error.message,
            };
          }
          return {
            success: false,
            message: "Unknown Error",
          };
        }
      },

      // MARK: Settings related actions
      async setTranslationBranch(branch: "-1" | "0" | "1") {
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
      async setServerState(state: boolean) {
        try {
          if (state) {
            await backend.enableServer();
          }
          await backend.storeWrite("server", state ? "1" : "0");
          const newValue = await backend.getServerState();
          set({ serverState: newValue });
        } catch (error) {}
      },
      async setWatchState(state: boolean) {
        try {
          await backend.toggleWatchState(state, false);
          const newValue = await backend.getWatchState();
          set({ watchState: newValue });
        } catch (error) {}
      },
    };
  });
