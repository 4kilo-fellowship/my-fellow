import { API_URL } from "@/constants";
import { expoClient } from "@better-auth/expo/client";
import { phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

// Base auth API URL (strip trailing /api or keep as auth base)
const authBaseURL = API_URL.replace(/\/api\/?$/, "");

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    expoClient({
      scheme: "my-fellow",
      storage: SecureStore,
    }),
    phoneNumberClient(),
  ],
});
