import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { NativeColorPickerProps } from "./types";

const EXTENDED_PALETTE = [
  "#55B752",
  "#7C3AED",
  "#0284C7",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#6366F1",
  "#18181B",
  "#E2E8F0",
];

export function NativeColorPicker({
  color,
  onColorChange,
  label = "Custom Color",
  isDark = false,
}: NativeColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);
  const [isEditing, setIsEditing] = useState(false);

  const textColor = isDark ? "#FFFFFF" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";
  const borderColor = isDark ? "#27272A" : "#E2E8F0";

  const handleSelectColor = (selectedHex: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setHexInput(selectedHex);
    onColorChange(selectedHex);
  };

  const handleHexChange = (text: string) => {
    let clean = text.trim();
    if (!clean.startsWith("#")) {
      clean = `#${clean}`;
    }
    setHexInput(clean);
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      onColorChange(clean);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <View style={[styles.previewDot, { backgroundColor: color }]} />
          <Text style={[styles.labelText, { color: textColor }]}>{label}</Text>
        </View>

        <Pressable
          onPress={() => setIsEditing(!isEditing)}
          style={[
            styles.hexButton,
            { borderColor, backgroundColor: isDark ? "#141416" : "#F8FAFC" },
          ]}
        >
          <Text style={[styles.hexButtonText, { color: textColor }]}>
            {color.toUpperCase()}
          </Text>
          <Ionicons
            name={isEditing ? "chevron-up" : "create-outline"}
            size={14}
            color={subTextColor}
          />
        </Pressable>
      </View>

      {isEditing && (
        <View style={styles.customInputRow}>
          <Text style={[styles.hashSymbol, { color: subTextColor }]}>HEX</Text>
          <TextInput
            value={hexInput}
            onChangeText={handleHexChange}
            placeholder="#RRGGBB"
            placeholderTextColor={subTextColor}
            maxLength={7}
            autoCapitalize="characters"
            style={[
              styles.textInput,
              {
                color: textColor,
                borderColor,
                backgroundColor: isDark ? "#141416" : "#F8FAFC",
              },
            ]}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.swatchesRow}
      >
        {EXTENDED_PALETTE.map((hex) => {
          const isSelected = color.toLowerCase() === hex.toLowerCase();
          return (
            <Pressable
              key={hex}
              onPress={() => handleSelectColor(hex)}
              style={[
                styles.swatchWrap,
                isSelected && { borderColor: textColor, borderWidth: 2 },
              ]}
            >
              <View style={[styles.swatchCircle, { backgroundColor: hex }]}>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color={hex === "#E2E8F0" ? "#0F172A" : "#FFFFFF"}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hexButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  hexButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  hashSymbol: {
    fontSize: 12,
    fontWeight: "700",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  swatchesRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  swatchWrap: {
    padding: 3,
    borderRadius: 18,
    overflow: "hidden",
  },
  swatchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
