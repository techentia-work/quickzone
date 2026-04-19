// @/lib/types/user/user.types.ts (Updated)

import { UserRole } from "../auth/auth.enums";

export interface UserType {
  _id: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  isAdmin?: boolean;
}

export interface UserProfileType {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  walletAddress?: string;
  email: string;
  role: UserRole;
  balance: number;
  points: number;
  status: string;
  isActive: boolean;
  isDeleted: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isAdmin: boolean;
  isAdminUser: boolean;
  isLocked: boolean;
  deletedAt: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;

  metadata: {
    preferences?: {
      notifications?: {
        email: boolean;
        push: boolean;
      };
    };
    twoFactorEnabled?: boolean;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    _id?: string;
    id?: string;
  };
}