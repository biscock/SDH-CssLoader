import { DialogButton } from "@decky/ui";
import { useThemeBrowserStoreAction, useThemeBrowserStoreValue } from "../context";

export function LoadMoreButton() {
  const searchOpts = useThemeBrowserStoreValue("searchOpts");
  const themeTotal = useThemeBrowserStoreValue("themeTotal");
  const themes = useThemeBrowserStoreValue("themes");
  const loading = useThemeBrowserStoreValue("loading");
  const setSearchOpts = useThemeBrowserStoreAction("setSearchOpts");

  function handleClick() {
    void setSearchOpts({ ...searchOpts, page: searchOpts.page + 1 });
  }

  return (
    <>
      {themes.length < themeTotal ? (
        <>
          <DialogButton onClick={handleClick} disabled={loading}>
            Load More
          </DialogButton>
        </>
      ) : null}
    </>
  );
}
