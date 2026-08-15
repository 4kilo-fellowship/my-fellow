import React, { createRef, RefObject, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

export default function OtpInput({
  length,
  value,
  onChange,
  isDark,
}: OtpInputProps) {
  const inputs = useRef<RefObject<TextInput>[]>([]);

  const focusNext = (index: number) => {
    const next = inputs.current[index + 1];
    if (next?.current) {
      next.current.focus();
    }
  };

  const focusPrevious = (index: number) => {
    const prev = inputs.current[index - 1];
    if (prev?.current) {
      prev.current.focus();
    }
  };

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, "");
    
    // Handle multi-character input (Pasting full OTP code)
    if (digits.length > 1) {
      const pasted = digits.slice(0, length);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      inputs.current[nextIndex]?.current?.focus();
      return;
    }

    const digit = digits.slice(-1);
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (digit) {
      focusNext(index);
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace" && !value[index]) {
      focusPrevious(index);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const filled = !!value[index];
        const ref = inputs.current[index] ?? createRef<TextInput>();
        inputs.current[index] = ref;

        return (
          <TextInput
            key={index}
            ref={ref}
            value={value[index] ?? ""}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={length}
            autoFocus={index === 0}
            selectionColor="#ff6719"
            caretHidden={false}
            style={[
              styles.box,
              {
                backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                borderColor: filled
                  ? "#ff6719"
                  : isDark
                    ? "#334155"
                    : "#e2e8f0",
                color: isDark ? "#ffffff" : "#0f172a",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
});
