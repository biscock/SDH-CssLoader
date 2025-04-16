import { useCSSLoaderValues } from "@/backend";
import { ThemeCard } from "@/lib";
import { useExpandedViewAction } from "@/modules/expanded-view";
import { Focusable } from "@decky/ui";
import { useEffect, useRef } from "react";
import { ImSpinner5 } from "react-icons/im";
import { useThemeBrowserStoreAction, useThemeBrowserStoreValue } from "../context";
import { BrowserSearchFields } from "./BrowserSearchFields";
import { LoadMoreButton } from "./LoadMoreButton";

export function ThemeBrowserPage() {
  const initializeStore = useThemeBrowserStoreAction("initializeStore");
  const isInitialized = useThemeBrowserStoreValue("isInitialized");
  const themes = useThemeBrowserStoreValue("themes");
  const loading = useThemeBrowserStoreValue("loading");
  const indexToSnapToOnLoad = useThemeBrowserStoreValue("indexToSnapToOnLoad");
  const { backendVersion } = useCSSLoaderValues();

  const openTheme = useExpandedViewAction("openTheme");

  const endOfPageRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInitialized) return;
    void initializeStore();
  }, []);

  useEffect(() => {
    if (endOfPageRef?.current) {
      endOfPageRef?.current?.focus();
    }
  }, [indexToSnapToOnLoad]);

  return (
    <>
      <BrowserSearchFields />
      <Focusable className="flex flex-wrap justify-center gap-2">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center gap-4">
            <ImSpinner5 className="cl_spinny" size={48} />
            {/* Re-using expanded view's loading class */}
            <span className="cl_expandedview_loadingtext">Loading</span>
          </div>
        ) : (
          themes
            .filter((theme) => theme.manifestVersion <= backendVersion)
            .map((theme, index) => (
              <ThemeCard
                onClick={() => openTheme(theme.id)}
                ref={
                  index === indexToSnapToOnLoad
                    ? endOfPageRef
                    : index === 0
                    ? firstCardRef
                    : undefined
                }
                key={theme.id}
                theme={theme}
              />
            ))
        )}
      </Focusable>
      <LoadMoreButton />
    </>
  );
}
