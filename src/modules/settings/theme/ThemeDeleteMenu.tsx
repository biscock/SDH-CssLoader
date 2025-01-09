import { DeleteConfirmationModal } from "@/lib";
import { Theme } from "@/types";
import { DialogButton, DialogCheckbox, Focusable, showModal } from "@decky/ui";
import { useState } from "react";

export function ThemeDeleteMenu({
  sortedThemeList,
  onLeave,
}: {
  sortedThemeList: Theme[];
  onLeave: () => void;
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
            <DeleteConfirmationModal themeIdsToBeDeleted={choppingBlock} onDeleteFinish={onLeave} />
          );
        }}
      >
        Delete
      </DialogButton>
    </Focusable>
  );
}
