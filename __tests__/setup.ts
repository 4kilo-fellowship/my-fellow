(globalThis as any).__DEV__ = true;

import { plugin } from "bun";
import { mock } from "bun:test";

mock.module("react-native", () => ({
  Platform: { OS: "ios", select: (obj: any) => obj.ios },
  StyleSheet: { create: (s: any) => s, hairlineWidth: 1 },
}));

mock.module("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}));

mock.module("expo-secure-store", () => ({
  getItemAsync: async () => null,
  setItemAsync: async () => {},
  deleteItemAsync: async () => {},
}));

mock.module("expo-modules-core", () => ({
  EventEmitter: class {},
  NativeModulesProxy: {},
}));

plugin({
  name: "image-asset-loader",
  setup(build) {
    build.onLoad({ filter: /\.(png|jpg|jpeg|gif|webp|svg)$/ }, () => {
      return {
        exports: { default: 1 },
        loader: "object",
      };
    });
  },
});
