import { useCSSLoaderValues } from "@/backend";
import { PanelSection } from "@decky/ui";

export function QamDummyFunctionBoundary({ children }: { children: React.ReactNode }) {
  const { dummyFunctionResult } = useCSSLoaderValues();

  if (!dummyFunctionResult) {
    return (
      <>
        <PanelSection>
          <span>
            CSS Loader failed to initialize, try reloading, and if that doesn't work, try restarting
            your deck.
          </span>
        </PanelSection>
      </>
    );
  }

  return <>{children}</>;
}
