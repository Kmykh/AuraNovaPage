export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  adminName?: string;
  Token?: string;
  AdminName?: string;
}
