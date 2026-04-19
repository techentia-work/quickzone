import { UserRole } from "./auth.enums";

export interface AuthenticatedUser {
  _id: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  isAdmin?: boolean;
}