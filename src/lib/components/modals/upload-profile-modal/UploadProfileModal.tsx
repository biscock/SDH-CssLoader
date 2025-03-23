import { useCSSLoaderActions } from "@/backend";
import { Theme } from "@/types";
import { DropdownItem, Focusable, sleep, TextField, ToggleField } from "@decky/ui";
import { useState } from "react";
import { ImSpinner5 } from "react-icons/im";
import { ConfirmModal } from "../../../primitives";

export function UploadProfileModal({
  onUploadFinish,
  closeModal,
  eligibleProfiles,
}: {
  onUploadFinish?: () => void;
  closeModal?: () => void;
  eligibleProfiles: Theme[];
}) {
  const { publishProfile } = useCSSLoaderActions();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isPublic, setPublic] = useState(false);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>();

  async function handleUpload() {
    if (!selectedProfileId) return;
    setLoading(true);
    const result = await publishProfile(selectedProfileId, isPublic, description);
    setResult(result);
    setLoading(false);

    if (result.success) {
      onUploadFinish?.();
    }

    await sleep(result.success ? 1000 : 5000);
    closeModal?.();
  }

  return (
    <ConfirmModal
      title="Upload Profile"
      confirmText="Upload"
      onConfirm={handleUpload}
      closeModal={closeModal}
      cancelDisabled={loading}
      confirmDisabled={loading || !selectedProfileId || !!result}
    >
      {loading ? (
        <div className="h-full w-full flex items-center justify-center gap-4">
          <ImSpinner5 className="cl_spinny" size={48} />
          {/* Re-using expanded view's loading class */}
          <span className="cl_expandedview_loadingtext">Loading</span>
        </div>
      ) : result ? (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{result.success ? "Success" : "Error"}</span>
          {!result.success && <p>{result.message}</p>}
          {isPublic && (
            <p>
              Since this profile is public, it will need to be reviewed before it is published. As
              such it won't show up immediately
            </p>
          )}
        </div>
      ) : (
        <Focusable className="!flex !flex-col !gap-4">
          <DropdownItem
            selectedOption={selectedProfileId}
            rgOptions={eligibleProfiles.map((e) => ({ data: e.id, label: e.display_name }))}
            onChange={(option) => {
              setSelectedProfileId(option.data);
            }}
            label="Profile to Upload"
          />
          <ToggleField checked={isPublic} onChange={setPublic} label="Make Profile Public" />
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </Focusable>
      )}
    </ConfirmModal>
  );
}
