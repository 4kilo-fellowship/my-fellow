import React from "react";
import { View, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

interface WaveBackgroundProps {
  height?: number;
  color?: string;
}

export default function WaveBackground({
  height = 300,
  color = "rgb(255, 103, 25)",
}: WaveBackgroundProps) {
  // Create a smooth, flowing wavy path with multiple curves
  const wavePath = `
    M 0 ${height * 0.65}
    C ${width * 0.15} ${height * 0.55}, ${width * 0.35} ${height * 0.45}, ${width * 0.5} ${height * 0.5}
    C ${width * 0.65} ${height * 0.55}, ${width * 0.85} ${height * 0.45}, ${width} ${height * 0.5}
    L ${width} 0
    L 0 0
    Z
  `;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height,
        overflow: "hidden",
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute" }}
      >
        <Path d={wavePath} fill={color} />
      </Svg>
    </View>
  );
}

