"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description?: string;
}

export function DeleteDialog({ open, onClose, onConfirm, title, description }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10">
          <AlertTriangle className="h-6 w-6 text-status-error" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-status-error hover:bg-status-error/90"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
