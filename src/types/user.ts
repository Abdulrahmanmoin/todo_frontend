export type UUID = string;

/**
 * User interface for frontend application
 * Based on the data model but excludes sensitive fields like hashed_password
 */
export interface User {
  user_id: UUID;             // UUID string - Unique identifier for each user
  email: string;             // User's email address (unique, required)
  username: string;          // User's chosen username (unique, required)
  created_at: string;        // ISO date string - Timestamp when user account was created
  updated_at: string;        // ISO date string - Timestamp when user account was last updated
  is_active: boolean;        // Whether the user account is active (default: true)
}

/**
 * Interface for user creation (registration)
 */
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * Interface for user login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface for user login response (excluding sensitive data)
 */
export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Interface for user updates
 */
export interface UpdateUserRequest {
  email?: string;
  username?: string;
}