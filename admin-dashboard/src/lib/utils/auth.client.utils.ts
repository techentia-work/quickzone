// @/lib/utils/auth.client.utils.ts
import { AuthenticatedUser, UserRole, RegisterRequest, LoginRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, InitiateChangePasswordRequest, CompleteChangePasswordRequest } from '@/lib/types';

// Storage utilities
export const authStorage = {
  keys: {
    USER: 'current_user',
    AUTH_STATE: 'auth_state'
  },

  getUser(): AuthenticatedUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.keys.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      this.clear();
      return null;
    }
  },

  setUser(user: AuthenticatedUser): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.keys.USER, JSON.stringify(user));
      this.setState({ isAuthenticated: true, lastCheck: Date.now() });
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  setState(state: { isAuthenticated: boolean; lastCheck?: number }): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.keys.AUTH_STATE, JSON.stringify({
        ...state,
        lastCheck: state.lastCheck || Date.now()
      }));
    } catch (error) {
      console.error('Auth state error:', error);
    }
  },

  getState(): { isAuthenticated: boolean; lastCheck?: number } | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.keys.AUTH_STATE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.keys.USER);
      localStorage.removeItem(this.keys.AUTH_STATE);
    } catch (error) {
      console.error('Clear storage error:', error);
    }
  }
};

// Route utilities
export const routeUtils = {
  publicRoutes: ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-otp'],
  privateRoutes: ['/dashboard', '/profile', '/settings', '/admin', '/user'],

  isPublic(path: string): boolean {
    return this.publicRoutes.some(route => path.startsWith(route));
  },

  isPrivate(path: string): boolean {
    return this.privateRoutes.some(route => path.startsWith(route));
  },

  requiresAuth(path: string): boolean {
    return !this.isPublic(path);
  }
};

// Auth utilities
export const authUtils = {
  isAuthenticated(): boolean {
    const user = authStorage.getUser();
    const state = authStorage.getState();
    return !!(user && state?.isAuthenticated);
  },

  getCurrentUser(): AuthenticatedUser | null {
    return authStorage.getUser();
  },

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const hierarchy = { [UserRole.USER]: 1, [UserRole.DELIVERY_BOY]: 2, [UserRole.SELLER]: 2, [UserRole.ADMIN]: 3 };
    return (hierarchy[user.role] || 0) >= (hierarchy[role] || 0);
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!(user?.isAdmin || user?.role === UserRole.ADMIN);
  },

  updateUser(updates: Partial<AuthenticatedUser>): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      authStorage.setUser({ ...user, ...updates });
      return true;
    } catch {
      return false;
    }
  },

  logout(): void {
    authStorage.clear();
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
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  },

  validateRegister(data: FormData): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.firstName?.trim()) errors.firstName = 'First name required';
    else if (data.firstName.trim().length < 2) errors.firstName = 'First name too short';

    if (!data.lastName?.trim()) errors.lastName = 'Last name required';
    else if (data.lastName.trim().length < 2) errors.lastName = 'Last name too short';

    if (!data.email?.trim() && !data.phone?.trim()) {
      errors.contact = 'Email or phone required';
      errors.email = 'Email or phone required';
      errors.phone = 'Email or phone required';
    }

    if (data.email?.trim() && !this.isValidEmail(data.email.trim())) {
      errors.email = 'Invalid email format';
    }

    if (data.phone?.trim() && !this.isValidPhone(data.phone.trim())) {
      errors.phone = 'Invalid phone format';
    }

    if (!data.password) errors.password = 'Password required';
    else if (!this.isValidPassword(data.password)) {
      errors.password = 'Password must be 8+ chars with letters and numbers';
    }

    if (!data.confirmPassword) errors.confirmPassword = 'Confirm password';
    else if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';

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

    if (!data.password?.trim()) errors.password = 'Password required';

    return errors;
  },

  validateOTP(data: VerifyOTPRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.identifier?.trim()) errors.identifier = 'Email or phone required';
    if (!data.otp?.trim()) errors.otp = 'OTP required';
    else if (!/^\d{6}$/.test(data.otp.trim())) errors.otp = 'OTP must be 6 digits';
    if (!data.purpose?.trim()) errors.purpose = 'Purpose required';

    return errors;
  },

  validateForgotPassword(data: ForgotPasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.email?.trim()) errors.email = 'Email required';
    else if (!this.isValidEmail(data.email.trim())) errors.email = 'Invalid email format';

    return errors;
  },

  validateResetPassword(data: ResetPasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.resetToken?.trim()) errors.resetToken = 'Reset token required';
    if (!data.identifier?.trim()) errors.identifier = 'Email or phone required';
    if (!data.newPassword) errors.newPassword = 'New password required';
    else if (!this.isValidPassword(data.newPassword)) {
      errors.newPassword = 'Password must be 8+ chars with letters and numbers';
    }

    return errors;
  },

  validateInitiateChangePassword(data: InitiateChangePasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!data.currentPassword?.trim()) errors.currentPassword = 'Current password required';
    return errors;
  },

  validateCompleteChangePassword(data: CompleteChangePasswordRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!data.changeToken?.trim()) errors.changeToken = 'Change token required';
    if (!data.identifier?.trim()) errors.identifier = 'Email or phone required';
    if (!data.newPassword) errors.newPassword = 'New password required';
    else if (!this.isValidPassword(data.newPassword)) {
      errors.newPassword = 'Password must be 8+ chars with letters and numbers';
    }

    return errors;
  }
};

// Combined auth client utilities
export const authClientUtils = {
  ...authUtils,
  ...validationUtils,
  storage: authStorage,
  routes: routeUtils
};