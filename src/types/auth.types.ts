export type UserRole = 'user' | 'trainer' | 'admin';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface AuthError {
  message: string;
}

// export interface VerifyEmail {
//   email: string;
//   code: string;
// }

export interface GoogleAuthRequest {
  token: string;
}

export interface GoogleAuthResponse {
  message: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  isEmailVerified: boolean;
  height: number;
  weight: number;
  age: number;
  createdAt: string;
  isPremium: boolean;
}

export interface MeResponse {
  message: string;
  user: User;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  user: User;
  isNewUser: boolean;
}

export interface GoogleAuthRequest {
  code: string;
  role: UserRole;
}
