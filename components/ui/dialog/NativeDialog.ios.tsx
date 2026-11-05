import React from 'react';
import { Host } from '@expo/ui';
import { Alert, Button, Text } from '@expo/ui/swift-ui';
import { DialogOptions } from './NativeDialog.types';

export const NativeDialog: React.FC<DialogOptions> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onDismiss,
}) => {
  const isConfirmation = type === 'confirmation';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onDismiss();
    }
  };

  return (
    <Host matchContents>
      <Alert
        isPresented={visible}
        onIsPresentedChange={(presented) => {
          if (!presented) {
            onDismiss();
          }
        }}
        title={title}>
        <Alert.Actions>
          {isConfirmation ? (
            <>
              <Button role="cancel" label={cancelText} onPress={onDismiss} />
              <Button
                role={destructive ? 'destructive' : 'default'}
                label={confirmText}
                onPress={handleConfirm}
              />
            </>
          ) : (
            <Button
              role={destructive ? 'destructive' : 'default'}
              label={confirmText}
              onPress={handleConfirm}
            />
          )}
        </Alert.Actions>
        {message ? (
          <Alert.Message>
            <Text>{message}</Text>
          </Alert.Message>
        ) : null}
      </Alert>
    </Host>
  );
};

export default NativeDialog;
