import { ButtonItem, PanelSectionRow } from "@decky/ui";
import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { useEffect, useRef } from "react";

export function QamRefreshButton() {
  const { reloadPlugin } = useCSSLoaderActions();
  const { isWorking } = useCSSLoaderValues();

  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  async function handleRefresh() {
    await reloadPlugin();
    // This just ensures focus isn't lost
    refreshButtonRef.current?.focus();
  }

  return (
    <PanelSectionRow>
      <ButtonItem
        // @ts-ignore Not typed currently
        ref={refreshButtonRef}
        disabled={isWorking}
        onClick={() => {
          void handleRefresh();
        }}
        layout="below"
      >
        Refresh
      </ButtonItem>
    </PanelSectionRow>
  );
}
