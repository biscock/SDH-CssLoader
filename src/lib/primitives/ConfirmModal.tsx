import { ConfirmModal as CM } from "@decky/ui";
import { StyleProvider } from "../providers";

export function ConfirmModal({
  closeModal,
  children,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  confirmDisabled,
  cancelDisabled,
}: {
  closeModal?: () => void;
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
}) {
  return (
    <CM
      strTitle={title}
      strDescription={description}
      strOKButtonText={confirmText}
      strCancelButtonText={cancelText}
      onOK={onConfirm}
      onCancel={closeModal}
      onEscKeypress={closeModal}
      bOKDisabled={confirmDisabled}
      bCancelDisabled={cancelDisabled}
    >
      <StyleProvider>{children}</StyleProvider>
    </CM>
  );
}
