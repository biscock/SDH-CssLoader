import { useCSSLoaderActions, useCSSLoaderValues } from "@/backend";
import { TextField } from "@decky/ui";
import { useState } from "react";
import { ConfirmModal } from "../../../primitives";

export function CreateProfileModal({ closeModal }: { closeModal?: () => void }) {
  const { themes } = useCSSLoaderValues();
  const { createPreset, toast } = useCSSLoaderActions();
  const numOfEnabledThemes = themes.filter((e) => e.enabled).length;

  const [name, setName] = useState("");

  async function handleCreate() {
    const formattedName = name.trim();
    if (formattedName.length === 0) {
      toast("Invalid Name");
      return;
    }
    await createPreset(formattedName);
    closeModal?.();
  }

  return (
    <ConfirmModal
      title="Create Profile"
      description={`This profile will combine all ${numOfEnabledThemes} theme${
        numOfEnabledThemes === 1 ? "" : "s"
      } you currently have enabled. Selecting the profile will toggle them all at once.`}
      confirmText="Create"
      onConfirm={handleCreate}
      closeModal={closeModal}
    >
      <div className="mb-4" />
      <TextField
        label="Profile Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
    </ConfirmModal>
  );
}
