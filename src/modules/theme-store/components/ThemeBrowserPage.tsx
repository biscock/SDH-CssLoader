import { Focusable } from "@decky/ui";
import { useThemeBrowserStoreAction, useThemeBrowserStoreValue } from "../context";
import { BrowserSearchFields } from "./BrowserSearchFields";
import { useCSSLoaderValue } from "@/backend";
import { useEffect, useRef } from "react";
import { ImSpinner5 } from "react-icons/im";
import { LoadMoreButton } from "./LoadMoreButton";
import { useExpandedViewAction } from "@/modules/expanded-view";
import { ThemeCard } from "@/lib";

export function ThemeBrowserPage() {
  const initializeStore = useThemeBrowserStoreAction("initializeStore");
  const themes = useThemeBrowserStoreValue("themes");
  const loading = useThemeBrowserStoreValue("loading");
  const indexToSnapToOnLoad = useThemeBrowserStoreValue("indexToSnapToOnLoad");
  const backendVersion = useCSSLoaderValue("backendVersion");

  const openTheme = useExpandedViewAction("openTheme");

  const endOfPageRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
