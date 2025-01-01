import { Flags, Theme } from "@/types";
import { showModal } from "@decky/ui";
import { getCSSLoaderState } from "@/backend";
import { getDeckyPatchState } from "../../decky-patches";
// Hardcoded to prevent dep cycle
import { OptionalDepsModal } from "../components/modals/optional-deps-modal";
import { NavPatchInfoModal } from "../components/modals/nav-patch-info-modal";

export async function toggleThemeWithModals(theme: Theme, value: boolean, rerender?: () => void) {
  const { toggleTheme } = getCSSLoaderState();
  const { navPatchInstance } = getDeckyPatchState();
  if (value && theme.flags.includes(Flags.optionalDeps)) {
    showModal(
      <OptionalDepsModal
        theme={theme}
        onSelect={(enableDeps?: boolean, enableDepValues?: boolean) => {
          toggleTheme(theme, value, enableDeps, enableDepValues);
        }}
      />
    );
    rerender?.();
  } else {
    await toggleTheme(theme, value);
  }

  if (value && theme.flags.includes(Flags.navPatch) && !navPatchInstance) {
    showModal(<NavPatchInfoModal />);
  }
}
