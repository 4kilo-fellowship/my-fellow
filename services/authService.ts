import {
  ApiResponse,
  LoginResponse,
  SignUpData,
  SignUpResponse,
  User,
} from "@/types";
import { AxiosError, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import api from "./api";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public serverMessage?: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ReactNativeFile {
  uri: string;
  name: string;
  type: string;
}

export class AuthService {
  private static normalizeUser(userData: any): User {
    if (!userData) return userData;

    return {
      id: userData.id,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      team: userData.team,
      department: userData.department,
      yearOfStudy: userData.yearOfStudy,
      telegramUserName: userData.telegramUserName,
      pastTeam: userData.pastTeam,
      profileImage: userData.profileImage || null,
      createdAt: userData.createdAt,
    };
  }

  private static normalizeResponse<T>(response: ApiResponse<T>): {
    user: User;
    token: string;
    message?: string;
  } {
    return {
      user: this.normalizeUser(response.user),
      token: response.token || "",
      message: response.message,
    };
  }

  private static createFormDataFile(uri: string): ReactNativeFile {
    const filename = uri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    return {
      uri,
      name: filename,
      type,
    };
  }

  private static handleError(error: unknown, defaultMessage: string): never {
    if (error instanceof AxiosError) {
      const serverMessage =
        error.response?.data?.message || error.response?.data?.error;
      const status = error.response?.status;

      throw new ApiError(
        `${defaultMessage}: ${serverMessage || error.message}`,
        status,
        serverMessage,
        error,
      );
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, undefined, error);
    }

    throw new ApiError(defaultMessage, undefined, undefined, error);
  }

  static async login(
    phoneNumber: string,
    password: string,
    config?: AxiosRequestConfig,
  ): Promise<LoginResponse> {
    try {
      if (!phoneNumber || !password) {
        throw new Error("Phone number and password are required");
      }

      const response = await api.post<ApiResponse<any>>(
        "/auth/signin",
        {
          phoneNumber,
          password,
        },
        config,
      );

      const { user, token } = this.normalizeResponse(response.data);
      return { user, token };
    } catch (error) {
      return this.handleError(error, "Login failed");
    }
  }

  static async signup(
    data: SignUpData,
    config?: AxiosRequestConfig,
  ): Promise<SignUpResponse> {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("phoneNumber", data.phoneNumber);

      if (data.password) formData.append("password", data.password);
      if (data.confirmPassword)
        formData.append("confirmPassword", data.confirmPassword);
      if (data.team) formData.append("team", data.team);
      if (data.department) formData.append("department", data.department);
      if (data.yearOfStudy) formData.append("yearOfStudy", data.yearOfStudy);
      if (data.telegramUserName)
        formData.append("telegramUserName", data.telegramUserName);
      if (data.pastTeam) formData.append("pastTeam", data.pastTeam);

      if (
        data.profileImage &&
        (data.profileImage.startsWith("file://") ||
          data.profileImage.startsWith("content://"))
      ) {
        const file = this.createFormDataFile(data.profileImage);
        formData.append("file", file as any);
      }

      const response = await api.post<ApiResponse<any>>(
        "/auth/signup",
        formData,
        config,
      );
      const { user, token } = this.normalizeResponse(response.data);

      return { user, token };
    } catch (error) {
      return this.handleError(error, "Registration failed");
    }
  }

  static async getCurrentUser(config?: AxiosRequestConfig): Promise<User> {
    try {
      const response = await api.get<ApiResponse<any>>("/auth/me", config);
      return this.normalizeUser(response.data.user);
    } catch (error) {
      return this.handleError(error, "Failed to get current user");
    }
  }

  static async updateProfile(
    data: Partial<SignUpData>,
    config?: AxiosRequestConfig,
  ): Promise<User> {
    try {
      let payload: any = data;
      const hasImage =
        data.profileImage &&
        (data.profileImage.startsWith("file://") ||
          data.profileImage.startsWith("content://"));

      if (hasImage) {
        const formData = new FormData();
        const file = this.createFormDataFile(data.profileImage!);
        formData.append("file", file as any);

        Object.entries(data).forEach(([key, value]) => {
          if (key !== "profileImage" && value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        payload = formData;
      }

      const response = await api.patch<ApiResponse<any>>(
        "/auth/profile",
        payload,
        config,
      );
      return this.normalizeUser(response.data.user);
    } catch (error) {
      return this.handleError(error, "Profile update failed");
    }
  }

  static async logout(): Promise<void> {
    await SecureStore.deleteItemAsync("userToken");
    delete api.defaults.headers.common.Authorization;
  }

  static async refreshToken(): Promise<string | null> {
    return null;
  }

  static async verifyToken(
    token: string,
    config?: AxiosRequestConfig,
  ): Promise<boolean> {
    try {
      await api.get("/verify", {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = {
  login: AuthService.login.bind(AuthService),
  signup: AuthService.signup.bind(AuthService),
  getCurrentUser: AuthService.getCurrentUser.bind(AuthService),
  verifyToken: AuthService.verifyToken.bind(AuthService),
  updateProfile: AuthService.updateProfile.bind(AuthService),
};
