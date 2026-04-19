// @/lib/types/auth.types.ts
import { UserAccountStatus, UserRole } from "../user/user.enums";
import { Document, Model, Query } from 'mongoose';

export interface AuthenticatedUser {
  _id: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  phone?: string;
  
  role: UserRole;
  isAdmin?: boolean;
}

export interface IUser {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    fcmTokens?: {
  token: string;
  createdAt: Date;
}[];
    password: string;
    role: UserRole;
    isAdmin: boolean;

    // Account Status and Security
    status: UserAccountStatus;
    isActive: boolean;
    isDeleted: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;

    // Security Metadata
    metadata?: {
        twoFactorEnabled?: boolean;
        emailVerified?: boolean;
        phoneVerified?: boolean;
        lockUntil?: Date;
        passwordChangedAt: Date;
        passwordResetToken: String;
        passwordResetExpiry: Date;
        passwordChangeToken: String;
        passwordChangeExpiry: Date;
        preferences?: {
            notifications?: {
                email?: boolean;
                sms?: boolean;
                push?: boolean;
            };
        };
        securityQuestions?: Array<{
            question: string;
            answerHash: string;
        }>;
        [key: string]: any;
    };

    // Timestamps
    lastLogin?: Date;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Virtual fields
    fullName: string;
    isLocked: boolean;
}

// Document interface (combines IUser with Document and instance methods)
export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
    generatePasswordResetToken(): string;
    softDelete(): Promise<void>;
    // Virtual properties
    fullName: string;
    isAdminUser: boolean;
}

// Model interface (combines static methods with the Model)
export interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Query<IUserDocument | null, IUserDocument>;
    findByPhone(phone: string): Query<IUserDocument | null, IUserDocument>;
}
