import React, { useCallback, useMemo, useRef } from 'react';
import {
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image, ImageStyle } from 'expo-image';
import { openAvatarPreview, type Rect } from './avatarPreviewApi';
import { getHiResAvatarUrl } from './getHiResAvatarUrl';

export type LongPressAvatarProps = {
  size: number;
  uri?: string;              // Small avatar already rendered/cached
  hiResUri?: string;         // Optional >=1000px avatar variant (auto-derived if omitted)
  name?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: React.ReactNode; // Optional custom avatar elements
  onPress?: () => void;      // Optional single tap handler
};

export function LongPressAvatar({
  size,
  uri,
  hiResUri,
  name,
  style,
  imageStyle,
  children,
  onPress,
}: LongPressAvatarProps) {
  const outerRef = useRef<React.ComponentRef<typeof View>>(null); // Unscaled wrapper measured via measureInWindow
  const rectRef = useRef<Rect | null>(null);
  const pressed = useSharedValue(0);

  const resolvedHiResUri = hiResUri ?? getHiResAvatarUrl(uri);

  const measure = useCallback(() => {
    outerRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      rectRef.current = { x, y, width, height };
    });
  }, []);

  const open = useCallback(() => {
    const rect = rectRef.current;
    const photo = resolvedHiResUri ?? uri;
    if (!rect || !photo) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics may not be supported on all environments
    }

    openAvatarPreview({
      uri: photo,
      placeholderUri: uri,
      rect,
      label: name ? `${name}'s profile photo` : undefined,
    });
  }, [name, resolvedHiResUri, uri]);

  const gesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .runOnJS(true)
      .minDuration(350)
      .maxDistance(12)
      .onBegin(() => {
        pressed.value = withTiming(1, { duration: 120 });
        measure();
        if (resolvedHiResUri) {
          Image.prefetch(resolvedHiResUri, 'memory-disk');
        }
      })
      .onStart(open)
      .onFinalize(() => {
        pressed.value = withTiming(0, { duration: 150 });
      });

    if (onPress) {
      const tap = Gesture.Tap()
        .runOnJS(true)
        .maxDuration(300)
        .onEnd(() => {
          onPress();
        });
      return Gesture.Exclusive(longPress, tap);
    }

    return longPress;
  }, [measure, open, onPress, pressed, resolvedHiResUri]);

  const feedback = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
    opacity: 1 - pressed.value * 0.1,
  }));

  // Edge case: if no photo URI is available, render placeholder without gesture
  if (!uri && !children) {
    return (
      <View
        ref={outerRef}
        collapsable={false}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#94a3b8',
          },
          style,
        ]}
      />
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <View
        ref={outerRef}
        collapsable={false} // Required for measureInWindow to work on Android
        accessible
        accessibilityRole="image"
        accessibilityLabel={name ? `${name}'s profile photo` : 'Profile photo'}
        accessibilityHint="Touch and hold to view larger"
        accessibilityActions={[{ name: 'activate', label: 'View photo' }]}
        onAccessibilityAction={open}
        style={[{ width: size, height: size }, style]}
      >
        <Animated.View style={feedback}>
          {children ? (
            children
          ) : (
            <Image
              source={{ uri }}
              cachePolicy="memory-disk"
              contentFit="cover"
              style={[
                { width: size, height: size, borderRadius: size / 2 },
                imageStyle,
              ]}
            />
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
