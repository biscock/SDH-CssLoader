import { Carousel, DialogButton, Focusable, findModuleExport, findSP, showModal } from "@decky/ui";
import { useCallback } from "react";

const FocusRing = findModuleExport((e) => e?.toString?.()?.includes("refMeasure"));

function PatchNotesModal({ closeModal }: { closeModal?: () => {} }) {
  const SP = findSP();
  return (
    <Focusable onCancelButton={closeModal}>
      <FocusRing>
        <Carousel
          fnItemRenderer={(id: number) => (
            <Focusable
              style={{
                marginTop: "40px",
                height: "calc( 100% - 40px )",
                overflowY: "scroll",
                display: "flex",
                justifyContent: "center",
                margin: "40px",
              }}
            >
              <div style={{ backgroundColor: "#f00" }}>
                <span>test {id}</span>
              </div>
            </Focusable>
          )}
          fnGetId={(id) => id}
          nNumItems={10}
          nHeight={SP.innerHeight - 40}
          nItemHeight={SP.innerHeight - 40}
          nItemMarginX={0}
          initialColumn={0}
          autoFocus={true}
          fnGetColumnWidth={() => SP.innerWidth}
          name="TEST"
        />
      </FocusRing>
    </Focusable>
  );
}

export function ShowModalButton() {
  const showPatchNotes = useCallback(() => {
    showModal(<PatchNotesModal />);
  }, []);

  return <DialogButton onClick={() => showPatchNotes()}>Show Modal</DialogButton>;
}
