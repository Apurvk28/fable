import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export const DeleteAgentModal = ({
  isOpen,
  onClose,
  onConfirm,
  agentName = '',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Agent Configuration"
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button id="btn-cancel-delete" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            id="btn-confirm-delete"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Permanently Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-sm bg-status-error/10 text-status-error flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-ink font-medium">
            Are you sure you want to delete <span className="font-bold underline decoration-status-error">{agentName}</span>?
          </p>
          <p className="text-xs text-ink-secondary leading-relaxed">
            This action cannot be undone. All configuration, system prompts, and custom parameters for this agent will be permanently removed.
          </p>
        </div>
      </div>
    </Modal>
  );
};
