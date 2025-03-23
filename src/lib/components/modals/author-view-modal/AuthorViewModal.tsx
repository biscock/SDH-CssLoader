import { useCSSLoaderActions } from "@/backend";
import { PartialCSSThemeInfo, ThemeQueryResponse, UserInfo } from "@/types";
import { Focusable } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { ImSpinner5 } from "react-icons/im";
import { Modal } from "../../../primitives";
import { ThemeCard, ThemeCardCSSVariableProvider } from "../../theme-card";
import { SupporterIcon } from "./SupporterIcon";

export function AuthorViewModal({
  closeModal,
  authorData,
  onThemeClick,
}: {
  closeModal?: () => void;
  authorData: UserInfo;
  onThemeClick?: (themeId: string) => void;
}) {
  const { apiFetch } = useCSSLoaderActions();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [themes, setThemes] = useState<PartialCSSThemeInfo[]>([]);

  const firstThemeRef = useRef<HTMLDivElement>(null);

  async function fetchThemeData() {
    const data: ThemeQueryResponse = await apiFetch(
      `/users/${authorData.id}/themes?page=1&perPage=50&filters=CSS&order=Most Downloaded`
    );
    if (data?.total && data.total > 0) {
      setThemes(data.items);
      setLoaded(true);
    }
  }
  useEffect(() => {
    fetchThemeData();
  }, []);

  useEffect(() => {
    if (firstThemeRef?.current) {
      setTimeout(() => {
        firstThemeRef?.current?.focus();
      }, 10);
    }
  }, [loaded]);

  return (
    <Modal closeModal={closeModal}>
      <ThemeCardCSSVariableProvider cardSize={4} />
      {loaded ? (
        <>
          <div className="cl_authorview_authorcontainer">
            <img className="cl_authorview_avatar" src={authorData.avatar} height={50} width={50} />
            <span className="cl_authorview_username">{authorData.username}</span>
            <div className="cl_authorview_supportericoncontainer">
              <SupporterIcon authorData={authorData} />
            </div>
          </div>
          <Focusable className="!flex !flex-wrap !justify-center !gap-2">
            {themes.map((theme, i) => {
              return (
                <ThemeCard
                  ref={i === 0 ? firstThemeRef : null}
                  theme={theme}
                  onClick={() => {
                    closeModal?.();
                    onThemeClick?.(theme.id);
                  }}
                />
              );
            })}
          </Focusable>
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center gap-4">
          <ImSpinner5 className="cl_spinny" size={48} />
          {/* Re-using expanded view's loading class */}
          <span className="cl_expandedview_loadingtext">Loading</span>
        </div>
      )}
    </Modal>
  );
}
