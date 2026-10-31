import React, { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { registerAvatarPreview, type PreviewPayload } from './avatarPreviewApi';

const OPEN_MS = 260;
const CLOSE_MS = 200;
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN = Easing.bezier(0.4, 0, 1, 1);

export function AvatarPreviewHost() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const unmount = useCallback(() => {
    setPayload(null);
  }, []);

  const open = useCallback(
    (p: PreviewPayload) => {
      // Ignore new opens while one is active/animating
      if (payload) return;
      progress.value = 0;
      setPayload(p);
    },
    [payload, progress]
  );

  const close = useCallback(() => {
    progress.value = withTiming(
      0,
      { duration: reduceMotion ? 120 : CLOSE_MS, easing: EASE_IN },
      (finished) => {
        if (finished) {
          scheduleOnRN(unmount);
        }
      }
    );
  }, [progress, reduceMotion, unmount]);

  useEffect(() => {
    registerAvatarPreview({ open, close });
    return () => registerAvatarPreview(null);
  }, [open, close]);

  // Play opening animation once mounted with progress 0
  useEffect(() => {
    if (!payload) return;
    progress.value = withTiming(1, {
      duration: reduceMotion ? 120 : OPEN_MS,
      easing: EASE_OUT,
    });
  }, [payload, progress, reduceMotion]);

  // Android hardware back / gesture closes preview first
  useEffect(() => {
    if (!payload) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [payload, close]);

  // Close preview immediately if app is backgrounded or inactive
  useEffect(() => {
    if (!payload) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        close();
      }
    });
    return () => sub.remove();
  }, [payload, close]);

  if (!payload) return null;

  return (
    <PreviewLayer
      payload={payload}
      progress={progress}
      onClose={close}
      reduceMotion={Boolean(reduceMotion)}
    />
  );
}

function PreviewLayer({
  payload,
  progress,
  onClose,
  reduceMotion,
}: {
  payload: PreviewPayload;
  progress: SharedValue<number>;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const { width: W, height: H } = useWindowDimensions();
  const D = Math.min(W * 0.72, 320);
  const { rect } = payload;

  // Offsets from screen center to avatar's center, and initial scale ratio
  const ox = rect.x + rect.width / 2 - W / 2;
  const oy = rect.y + rect.height / 2 - H / 2;
  const s0 = rect.width > 0 ? rect.width / D : 0.2;

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const photoStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: progress.value }
      : {
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [ox, 0]) },
            { translateY: interpolate(progress.value, [0, 1], [oy, 0]) },
            { scale: interpolate(progress.value, [0, 1], [s0, 1]) },
          ],
        }
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      accessibilityViewIsModal
      importantForAccessibility="yes"
    >
      {/* Optional iOS Blur underneath scrim */}
      {Platform.OS === 'ios' && (
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}

      {/* Dark backdrop scrim */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, backdropStyle]} />

      {/* Tapping anywhere outside the photo closes the preview */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close photo"
      />

      {/* Centered photo container (absorbs touches so tapping photo does NOT close) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: (W - D) / 2,
            top: (H - D) / 2,
            width: D,
            height: D,
          },
          styles.photo,
          photoStyle,
        ]}
      >
        <Image
          source={{ uri: payload.uri }}
          placeholder={payload.placeholderUri ? { uri: payload.placeholderUri } : undefined}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={120}
          priority="high"
          accessibilityLabel={payload.label ?? 'Profile photo'}
          style={{ width: D, height: D }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  photo: {
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 20,
  },
});
