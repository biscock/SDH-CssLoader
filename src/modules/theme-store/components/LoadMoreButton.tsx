import { DialogButton } from "@decky/ui";
import { useThemeBrowserStoreActions, useThemeBrowserStoreValues } from "../context";

export function LoadMoreButton() {
  const { searchOpts, themeTotal, themes, loading } = useThemeBrowserStoreValues();
  const { setSearchOpts } = useThemeBrowserStoreActions();

  function handleClick() {
    void setSearchOpts({ ...searchOpts, page: searchOpts.page + 1 });
  }

  return (
    <div className="cl-store-loadmore-container">
      {!loading && themes.length < themeTotal ? (
        <div className="max-w-1/2">
          <DialogButton onClick={handleClick} disabled={loading}>
            Load More
          </DialogButton>
        </div>
      ) : null}
    </div>
  );
}
