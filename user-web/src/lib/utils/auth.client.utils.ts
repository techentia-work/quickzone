// @/lib/utils/auth.client.utils.ts
import { RegisterRequest, LoginRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, InitiateChangePasswordRequest, CompleteChangePasswordRequest } from '@/lib/types';

// Route utilities
export const routeUtils = {
  privateRoutes: ['/profile', '/settings', '/admin', '/user'],

  isPrivate(path: string): boolean {
    return this.privateRoutes.some(route => path.startsWith(route));
  },

  requiresAuth(path: string): boolean {
    return this.isPrivate(path);
  }
};

// Validation utilities
export interface FormData extends Partial<RegisterRequest & LoginRequest> {
  confirmPassword?: string;
  otp?: string;
  resetToken?: string;
  currentPassword?: string;
  newPassword?: string;
  changeToken?: string;
  [key: string]: any;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validationUtils = {
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isValidPhone(phone: string): boolean {
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return /^[\+]?[1-9][\d]{9,14}$/.test(clean);
  },

  isValidPassword(password: string): boolean {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  },

  validateRegister(data: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name required';
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = 'First name too short';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name required';
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = 'Last name too short';
    }

    if (!data.email?.trim() && !data.phone?.trim()) {
      errors.contact = 'Email or phone required';
    }

    if (data.email?.trim() && !this.isValidEmail(data.email.trim())) {
      errors.email = 'Invalid email format';
    }

    if (data.phone?.trim() && !this.isValidPhone(data.phone.trim())) {
      errors.phone = 'Invalid phone format';
    }

    if (!data.password) {
      errors.password = 'Password required';
    } else if (!this.isValidPassword(data.password)) {
      errors.password = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirm password required';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  },

  validateLogin(data: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.email?.trim() && !data.phone?.trim()) {
      errors.contact = 'Email or phone required';
    }

    if (data.email?.trim() && !this.isValidEmail(data.email.trim())) {
      errors.email = 'Invalid email format';
    }

    if (data.phone?.trim() && !this.isValidPhone(data.phone.trim())) {
      errors.phone = 'Invalid phone format';
    }

    if (!data.password?.trim()) {
      errors.password = 'Password required';
    }

    return errors;
  },

  validateOTP(data: VerifyOTPRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.identifier?.trim()) {
      errors.identifier = 'Email or phone required';
    }

    if (!data.otp?.trim()) {
      errors.otp = 'OTP required';
    } else if (!/^\d{6}$/.test(data.otp.trim())) {
      errors.otp = 'OTP must be 6 digits';
    }

    if (!data.purpose?.trim()) {
      errors.purpose = 'Purpose required';
    }

    return errors;
  },

  validateForgotPassword(data: ForgotPasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.email?.trim()) {
      errors.email = 'Email required';
    } else if (!this.isValidEmail(data.email.trim())) {
      errors.email = 'Invalid email format';
    }

    return errors;
  },

  validateResetPassword(data: ResetPasswordRequest & { confirmPassword: string }): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.resetToken?.trim()) {
      errors.resetToken = 'Reset token required';
    }

    if (!data.identifier?.trim()) {
      errors.identifier = 'Email or phone required';
    }

    if (!data.newPassword) {
      errors.newPassword = 'New password required';
    } else if (!this.isValidPassword(data.newPassword)) {
      errors.newPassword = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (data.newPassword !== data.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    return errors;
  },

  validateInitiateChangePassword(data: InitiateChangePasswordRequest & { newPassword: string, confirmPassword: string }): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.currentPassword?.trim()) {
      errors.currentPassword = 'Current password required';
    } if (data.currentPassword.length < 8)
      errors.currentPassword = 'Current password must be at least 8 characters';

    if (!data.newPassword?.trim()) {
      errors.newPassword = 'New password required';
    } else if (!this.isValidPassword(data.newPassword)) {
      errors.newPassword = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
    } else if (!data.confirmPassword?.trim()) {
      errors.confirmPassword = 'Confirm password required';
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    return errors;
  },

  validateCompleteChangePassword(data: CompleteChangePasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.changeToken?.trim()) {
      errors.changeToken = 'Change token required';
    }

    if (!data.identifier?.trim()) {
      errors.identifier = 'Email or phone required';
    }

    if (!data.newPassword?.trim()) {
      errors.newPassword = 'New password required';
    } else if (!this.isValidPassword(data.newPassword)) {
      errors.newPassword = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return errors;
  }
};

// Combined auth client utilities
export const authClientUtils = {
  ...validationUtils,
  routes: routeUtils
};