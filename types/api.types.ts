export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
}
