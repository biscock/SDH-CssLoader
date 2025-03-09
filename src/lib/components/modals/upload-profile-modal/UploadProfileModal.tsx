import { useCSSLoaderActions } from "@/backend";
import { Theme } from "@/types";
import { DropdownItem, PanelSectionRow, TextField, ToggleField } from "@decky/ui";
import { useState } from "react";
import { ConfirmModal } from "../../../primitives";

export function UploadProfileModal({
  closeModal,
  eligibleProfiles,
}: {
  closeModal?: () => void;
  eligibleProfiles: Theme[];
}) {
  const { publishProfile } = useCSSLoaderActions();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isPublic, setPublic] = useState(false);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!selectedProfileId) return;
    setLoading(true);
    await publishProfile(selectedProfileId, isPublic, description);
    setLoading(false);

    // closeModal?.();
  }

  return (
    <ConfirmModal
      title="Upload Profile"
      confirmText="Upload"
      onConfirm={handleUpload}
      closeModal={closeModal}
      cancelDisabled={loading}
      confirmDisabled={loading || !selectedProfileId}
    >
      <PanelSectionRow>
        <DropdownItem
          selectedOption={selectedProfileId}
          rgOptions={eligibleProfiles.map((e) => ({ data: e.id, label: e.display_name }))}
          onChange={(option) => {
            setSelectedProfileId(option.data);
          }}
          label="Profile to Upload"
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField checked={isPublic} onChange={setPublic} label="Make Profile Public" />
      </PanelSectionRow>
      <PanelSectionRow>
        <TextField
          label="Description (Optional)"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </PanelSectionRow>
    </ConfirmModal>
  );
}
