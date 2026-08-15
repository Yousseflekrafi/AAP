import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onCancel} title={title ?? t("common.confirm")}>
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {cancelLabel ?? t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={
            danger
              ? "rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              : "rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          }
        >
          {confirmLabel ?? t("common.confirm")}
        </button>
      </div>
    </Modal>
  );
}
