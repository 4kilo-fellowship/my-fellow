export type OtpPurpose = "signup" | "update-phone";

export interface OtpSession {
  phoneNumber: string;
  purpose: OtpPurpose;
  otpToken: string;
}

export interface SendOtpPayload {
  phoneNumber: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  purpose: OtpPurpose;
  code: string;
}
