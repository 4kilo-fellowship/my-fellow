import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { DialogOptions } from './NativeDialog.types';

const { width } = Dimensions.get('window');

export const NativeDialog: React.FC<DialogOptions> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onDismiss,
}) => {
  const { isDark, colors } = useAppTheme();

  if (!visible) return null;

  const isConfirmation = type === 'confirmation';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onDismiss}
    >
      <Pressable style={styles.overlay} onPress={loading ? undefined : onDismiss}>
        <Pressable
          style={[
            styles.dialogCard,
            {
              backgroundColor: isDark ? colors.surfaceCard : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E2E8F0',
              borderWidth: isDark ? 1 : 0,
            },
          ]}
          onPress={(e) => e.stopPropagation()}>
          {/* Dialog Title */}
          {!!title && <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>{title}</Text>}

          {/* Dialog Message */}
          {!!message && <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>{message}</Text>}

          {/* Actions Row */}
          <View style={styles.buttonRow}>
            {isConfirmation && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={cancelText}
                disabled={loading}
                onPress={onDismiss}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? colors.surfaceElevated : '#F4F4F5',
                    borderColor: isDark ? colors.border : '#E4E4E7',
                  },
                  pressed && Platform.OS === 'ios' && styles.btnPressedIOS,
                ]}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? colors.textPrimary : '#18181B' }]}>{cancelText}</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              disabled={loading}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.confirmBtn,
                !isConfirmation && styles.fullWidthBtn,
                destructive ? styles.destructiveBtn : [styles.defaultConfirmBtn, { backgroundColor: isDark ? '#FFFFFF' : '#09090B' }],
                pressed && Platform.OS === 'ios' && styles.btnPressedIOS,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={isDark && !destructive ? '#000000' : '#FFFFFF'} />
              ) : (
                <Text style={[styles.confirmBtnText, { color: isDark && !destructive ? '#000000' : '#FFFFFF' }]}>{confirmText}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#09090B',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#52525B',
    lineHeight: 21,
    marginBottom: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancelBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#18181B',
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidthBtn: {
    flex: 1,
  },
  defaultConfirmBtn: {
    backgroundColor: '#09090B',
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
  },
  confirmBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPressedIOS: {
    opacity: 0.82,
  },
});

export default NativeDialog;
