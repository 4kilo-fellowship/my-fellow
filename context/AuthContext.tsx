import api from "@/services/api";
import { authService } from "@/services/authService";
import { useUserStore } from "@/stores/user.store";
import {
  AuthContextType,
  AuthProviderProps,
  AuthState,
  LoginResponse,
  SignUpData,
  SignUpResponse,
  User,
} from "@/types/types";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

// create a context for the auth
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// manage auth
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: null,
  });

  // load token on mount
  useEffect(() => {
    const loadToken = async (): Promise<void> => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setAuthState({ token, authenticated: true });
        } else {
          setAuthState({ token: null, authenticated: false });
        }
      } catch (error) {
        setAuthState({ token: null, authenticated: false });
      }
    };
    loadToken();
  }, []);

  // login function
  const login = async (
    phoneNumber: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await authService.login(phoneNumber, password);
      const { token } = response;

      // Store token securely
      await SecureStore.setItemAsync("userToken", token);

      // Set authorization header
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Update auth state
      setAuthState({ token, authenticated: true });

      // Save user to Zustand store if available in response
      if (response.user) {
        useUserStore.getState().setUser(response.user);
      }

      return response;
    } catch (error) {
      // Reset auth state on error
      setAuthState({ token: null, authenticated: false });
      throw error;
    }
  };

  // Sign up
  const signup = async (data: SignUpData): Promise<SignUpResponse> => {
    try {
      const response = await authService.signup(data);
      const { token } = response;

      // Store token securely
      await SecureStore.setItemAsync("userToken", token);

      // Set authorization header
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Update auth state
      setAuthState({ token, authenticated: true });

      // Save user to Zustand store if available in response
      if (response.user) {
        useUserStore.getState().setUser(response.user);
      }

      return response;
    } catch (error) {
      // Reset auth state on error
      setAuthState({ token: null, authenticated: false });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Remove token from secure storage
      await SecureStore.deleteItemAsync("userToken");

      // Clear authorization header
      api.defaults.headers.common.Authorization = "";

      setAuthState({ token: null, authenticated: false });

      // Clear user from Zustand store
      useUserStore.getState().clearUser();
    } catch (error) {
      // Still reset state even if storage deletion fails
      setAuthState({ token: null, authenticated: false });
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    const localUser = useUserStore.getState().user;
    if (localUser) return localUser;

    try {
      const user = await authService.getCurrentUser();
      useUserStore.getState().setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ authState, login, signup, logout, getCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
