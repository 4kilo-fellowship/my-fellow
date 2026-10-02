import { authClient } from "@/lib/auth-client";
import api from "@/services/api";
import { authService } from "@/services/authService";
import { useSignupStore } from "@/stores/signup.store";
import { useUserStore } from "@/stores/user.store";
import {
  ApiResponse,
  AuthContextType,
  AuthProviderProps,
  AuthState,
  ChangePasswordData,
  LoginResponse,
  RequestOtpResponse,
  ResetPasswordResponse,
  SignUpData,
  SignUpResponse,
  UpdatePhoneData,
  UpdatePhoneResponse,
  User,
  VerifyOtpResponse,
} from "@/types/auth.types";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async (): Promise<void> => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setAuthState({ token, authenticated: true });
          // Fetch fresh user data if we have a token
          authService
            .getCurrentUser()
            .then((user) => {
              useUserStore.getState().setUser(user);
            })
            .catch(console.error);
        } else {
          setAuthState({ token: null, authenticated: false });
        }
      } catch (error) {
        setAuthState({ token: null, authenticated: false });
      }
    };
    loadToken();
  }, []);

  const login = async (
    phoneNumber: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await authService.login(phoneNumber, password);
      const { token, user } = response;

      await SecureStore.setItemAsync("userToken", token);

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setAuthState({ token, authenticated: true });

      if (user) {
        useUserStore.getState().setUser(user);
      }

      useSignupStore.getState().clear();

      return response;
    } catch (error) {
      setAuthState({ token: null, authenticated: false });
      throw error;
    }
  };

  const signup = async (data: SignUpData): Promise<SignUpResponse> => {
    try {
      const response = await authService.signup(data);
      const { token, user } = response;

      await SecureStore.setItemAsync("userToken", token);

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      setAuthState({ token, authenticated: true });

      if (user) {
        useUserStore.getState().setUser(user);
      }

      return response;
    } catch (error) {
      setAuthState({ token: null, authenticated: false });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authClient.signOut().catch(() => {});
      await SecureStore.deleteItemAsync("userToken");

      api.defaults.headers.common.Authorization = "";

      setAuthState({ token: null, authenticated: false });
      useUserStore.getState().clearUser();
      useSignupStore.getState().clear();
    } catch (error) {
      setAuthState({ token: null, authenticated: false });
    }
  };

  const getCurrentUser = async (): Promise<User> => {
    try {
      const user = await authService.getCurrentUser();
      useUserStore.getState().setUser(user);
      return user;
    } catch (error) {
      const localUser = useUserStore.getState().user;
      if (localUser) return localUser;
      throw error;
    }
  };

  const updateProfile = async (data: Partial<SignUpData>): Promise<User> => {
    try {
      const updatedUser = await authService.updateProfile(data);
      useUserStore.getState().setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (
    data: ChangePasswordData,
  ): Promise<ApiResponse<void>> => {
    try {
      return await authService.changePassword(data);
    } catch (error) {
      throw error;
    }
  };

  const updatePhone = async (
    data: UpdatePhoneData,
  ): Promise<UpdatePhoneResponse> => {
    try {
      const response = await authService.updatePhone(data);
      const { token, user } = response;

      if (token) {
        setAuthState({ token, authenticated: true });
        useUserStore.getState().setUser(user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const requestOtp = async (
    phoneNumber: string,
    purpose: "signup" | "reset-password" = "signup",
  ): Promise<RequestOtpResponse> => {
    try {
      return await authService.requestOtp(phoneNumber, purpose);
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (
    phoneNumber: string,
    code: string,
    purpose: "signup" | "reset-password" = "signup",
  ): Promise<VerifyOtpResponse> => {
    try {
      return await authService.verifyOtp(phoneNumber, code, purpose);
    } catch (error) {
      throw error;
    }
  };

  const resetPasswordWithOtp = async (
    phoneNumber: string,
    verificationToken: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> => {
    try {
      const response = await authService.resetPassword(
        phoneNumber,
        verificationToken,
        newPassword,
      );
      if (response.token && response.user) {
        setAuthState({ token: response.token, authenticated: true });
        useUserStore.getState().setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        signup,
        logout,
        getCurrentUser,
        updateProfile,
        changePassword,
        updatePhone,
        requestOtp,
        verifyOtp,
        resetPasswordWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

