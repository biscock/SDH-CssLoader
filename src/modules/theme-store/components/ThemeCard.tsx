import { PartialCSSThemeInfo } from "@/types";
import { ColumnNumbers } from "../context";
import { forwardRef } from "react";
import { shortenNumber, useThemeInstallState } from "@/lib";
import { useCSSLoaderValue } from "@/backend";
import { AiOutlineDownload } from "react-icons/ai";
import { Focusable } from "@decky/ui";
import { FaBullseye, FaDownload, FaStar } from "react-icons/fa6";
import { useExpandedViewAction } from "@/modules/expanded-view";

interface ThemeCardProps {
  theme: PartialCSSThemeInfo;
  size?: ColumnNumbers;
  onClick?: () => void;
}

export const ThemeCard = forwardRef<HTMLDivElement, ThemeCardProps>(({ theme, onClick }, ref) => {
  const apiUrl = useCSSLoaderValue("apiUrl");
  const installStatus = useThemeInstallState(theme);

  const openTheme = useExpandedViewAction("openTheme");

  const imageUrl =
    theme?.images[0]?.id && theme.images[0].id !== "MISSING"
      ? `${apiUrl}/blobs/${theme.images[0].id}`
      : `https://share.deckthemes.com/cssplaceholder.png`;

  return (
    <div className="relative">
      {installStatus === "outdated" && (
        <div className="cl_storeitem_notifbubble">
          <AiOutlineDownload className="cl_storeitem_bubbleicon" />
        </div>
      )}
      <Focusable
        ref={ref}
        className="cl_storeitem_container"
        focusWithinClassName="gpfocuswithin"
        onActivate={() => {
          onClick?.();
          openTheme(theme.id);
        }}
      >
        <div className="cl_storeitem_imagecontainer">
          <img className="cl_storeitem_image" src={imageUrl} />
          <div className="cl_storeitem_imagedarkener" />
          <div className="cl_storeitem_supinfocontainer">
            <div className="cl_storeitem_iconinfoitem">
              <FaDownload />
              <span>
                {shortenNumber(theme.download.downloadCount) ?? theme.download.downloadCount}
              </span>
            </div>
            <div className="cl_storeitem_iconinfoitem">
              <FaStar />
              <span>{shortenNumber(theme.starCount) ?? theme.starCount}</span>
            </div>
            <div className="cl_storeitem_iconinfoitem">
              <FaBullseye />
              <span>{theme.target}</span>
            </div>
          </div>
        </div>
        <div className="cl_storeitem_maininfocontainer">
          <span className="cl_storeitem_title">{theme.displayName}</span>
          <span className="cl_storeitem_subtitle">
            {theme.version} - Last Updated {new Date(theme.updated).toLocaleDateString()}
          </span>
          <span className="cl_storeitem_subtitle">By {theme.specifiedAuthor}</span>
        </div>
      </Focusable>
    </div>
  );
});
