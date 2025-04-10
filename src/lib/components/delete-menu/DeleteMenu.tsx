import { Theme } from "@/types";
import { DialogButton, DialogCheckbox, Focusable, showModal } from "@decky/ui";
import { useState } from "react";
import { DeleteConfirmationModal } from "../modals";

export function DeleteMenu({
  sortedThemeList,
  onLeave,
  type = "theme",
}: {
  sortedThemeList: Theme[];
  onLeave: () => void;
  type?: "theme" | "profile";
}) {
  const [choppingBlock, setChoppingBlock] = useState<string[]>([]);

  return (
    <Focusable>
      {sortedThemeList.map((theme) => (
        <DialogCheckbox
          onChange={(checked) => {
            if (checked) {
              setChoppingBlock([...choppingBlock, theme.id]);
            } else {
              setChoppingBlock(choppingBlock.filter((f) => f !== theme.id));
            }
          }}
          checked={choppingBlock.includes(theme.id)}
          label={theme.display_name}
        />
      ))}
      <DialogButton
        onClick={() => {
          showModal(
            <DeleteConfirmationModal
              themeIdsToBeDeleted={choppingBlock}
              onDeleteFinish={onLeave}
              type={type}
            />
          );
        }}
      >
        Delete
      </DialogButton>
    </Focusable>
  );
}
