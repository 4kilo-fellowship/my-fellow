import React from 'react';
import { NativeDialog } from '@/components/ui/dialog';

export interface RegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  eventTitle: string;
  eventDate?: string;
  location?: string;
  isDark?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  eventTitle,
}) => {
  return (
    <NativeDialog
      visible={visible}
      type="confirmation"
      title="Submit Event Registration"
      message={`Are you sure you want to finish and register for "${eventTitle}"? Your spot will be reserved immediately.`}
      confirmText="Submit Now"
      cancelText="Cancel"
      loading={loading}
      onConfirm={onConfirm}
      onDismiss={onClose}
    />
  );
};

export default RegistrationModal;
