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
}: {
  closeModal?: () => void;
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
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
    >
      <StyleProvider>{children}</StyleProvider>
    </CM>
  );
}
