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
              setChoppingBlock([...choppingBlock, theme.name]);
            } else {
              setChoppingBlock(choppingBlock.filter((f) => f !== theme.name));
            }
          }}
          checked={choppingBlock.includes(theme.name)}
          label={theme.display_name}
        />
      ))}
      <DialogButton
        onClick={() => {
          showModal(
            <DeleteConfirmationModal themesToBeDeleted={choppingBlock} onDeleteFinish={onLeave} />
          );
        }}
      >
        Delete
      </DialogButton>
    </Focusable>
  );
}
