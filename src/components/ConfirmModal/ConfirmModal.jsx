import React from 'react';
import { proxy } from 'valtio';

import { useModal } from '@hooks/useModal';
import { BaseModal } from '../BaseModal';
import { Button } from '../Button';

const modalState = proxy({
  visible: false,
  mounted: false,
  timeoutId: null,
});

export const ConfirmModal = ({ active, onClose, onConfirm, children }) => {
  const { visible, mounted } = useModal(modalState, active);

  if (!mounted) return null;

  return (
    <BaseModal title="Confirmation" visible={visible} onClose={onClose}>
      <div className="mb-8 mt-4">{children}</div>
      <div className="flex justify-end gap-4">
        <Button onClick={onConfirm} variant="errorOutlined">
          Confirm
        </Button>
        <Button onClick={onClose} variant="primary">
          Cancel
        </Button>
      </div>
    </BaseModal>
  );
};
