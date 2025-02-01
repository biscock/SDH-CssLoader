import { LocalThemeStatus, PartialCSSThemeInfo, Theme } from "@/types";
import { useCSSLoaderValues } from "@/backend";

export function useThemeInstallState(theme: Theme | PartialCSSThemeInfo): LocalThemeStatus {
  const { updateStatuses } = useCSSLoaderValues();

  const status = updateStatuses.find((status) => status[0] === theme.id);
  if (status) {
    return status[1];
  }
  return "notinstalled";
}
