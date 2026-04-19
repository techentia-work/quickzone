// @/hooks/useAuth.ts
"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { authClientUtils } from '@/lib/utils/index';
import { LoginRequest, RegisterRequest, VerifyOTPRequest, ResendOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, UpdateProfileRequest, InitiateChangePasswordRequest, CompleteChangePasswordRequest } from '@/lib/types';
import { AuthenticatedUser, ApiResponse, OtpPurpose, UserRole } from '@/lib/types';
import { ROUTES } from '@/lib/consts';

// Auth flow state
interface AuthFlowState {
  requires2FA: boolean;
  tempIdentifier?: string;
  otpPurpose?: OtpPurpose;
  resetToken?: string;
  changeToken?: string;
}

// Error handling
const handleAuthError = (error: any, operation: string) => {
  console.error(`Auth ${operation} error:`, error);
  const message = error?.response?.data?.message || error?.message || `${operation} failed`;
  return new Error(message);
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Refs for managing auth checks and preventing excessive API calls
  const mountedRef = useRef(true);
  const lastAuthCheckRef = useRef(0);
  const isCheckingAuthRef = useRef(false);
  const lastToastRef = useRef(0);

  // Auth flow state
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>({
    requires2FA: false
  });

  // Route checks
  const isPublicRoute = authClientUtils.routes.isPublic(pathname ?? "");
  const isPrivateRoute = authClientUtils.routes.isPrivate(pathname ?? "");
  const requiresAuth = authClientUtils.routes.requiresAuth(pathname ?? "");

  // Toast throttling helper
  const showAuthError = useCallback((message: string = "Kindly Login first") => {
    const now = Date.now();
    if (now - lastToastRef.current > 5000) {
      toast.error(message);
      lastToastRef.current = now;
    }
  }, []);

  // Redirect to login
  const redirectToLogin = useCallback(() => {
    if (mountedRef.current && requiresAuth) {
      setTimeout(() => router.push(ROUTES.AUTH.LOGIN), 200);
    }
  }, [router, requiresAuth]);

  // Auth check with smart caching
  const performAuthCheck = useCallback(async (): Promise<AuthenticatedUser | null> => {
    // Skip for public routes
    if (isPublicRoute) return null;

    const now = Date.now();

    // Prevent rapid successive calls
    if (isCheckingAuthRef.current) {
      return authClientUtils.storage.getUser();
    }

    // Use cached data if recent (30 seconds)
    if (now - lastAuthCheckRef.current < 30 * 1000) {
      const cached = authClientUtils.storage.getUser();
      if (cached) return cached;
    }

    try {
      isCheckingAuthRef.current = true;
      lastAuthCheckRef.current = now;

      const response = await authAPI.getCurrentUser();

      if (!mountedRef.current) return null;

      if (response.success && response.data) {
        authClientUtils.storage.setUser(response.data);
        return response.data;
      } else {
        authClientUtils.storage.clear();
        if (requiresAuth) {
          // showAuthError();
          redirectToLogin();
        }
        return null;
      }
    } catch (error: any) {
      if (!mountedRef.current) return null;

      // Handle auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        authClientUtils.storage.clear();
        if (requiresAuth) {
          // showAuthError();
          redirectToLogin();
        }
        return null;
      }

      // For network errors, try cached data
      const cached = authClientUtils.storage.getUser();
      if (cached) return cached;

      return null;
    } finally {
      isCheckingAuthRef.current = false;
    }
  }, [isPublicRoute, requiresAuth, showAuthError, redirectToLogin]);

  // Main auth query
  const { data: user, isLoading: isAuthLoading, error: authError, refetch: refetchUser, isFetching } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: performAuthCheck,
    enabled: !isPublicRoute,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      return !(status === 401 || status === 403) && failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const isAuthenticated = !!user;

  const currentUser = useMemo(() => {
    return authClientUtils.getCurrentUser();
  }, [user]);

  // Update auth state helper
  const updateAuthState = useCallback((newUser: AuthenticatedUser | null) => {
    if (!mountedRef.current) return;

    queryClient.setQueryData(['auth', 'user'], newUser);

    if (newUser) {
      authClientUtils.storage.setUser(newUser);
    } else {
      authClientUtils.storage.clear();
    }
  }, [queryClient]);

  // Initial auth check for private routes
  useEffect(() => {
    if (isPrivateRoute && !isAuthenticated && !isAuthLoading) {
      const cached = authClientUtils.storage.getUser();
      if (!cached) {
        // showAuthError();
        redirectToLogin();
      }
    }
  }, [isPrivateRoute, isAuthenticated, isAuthLoading, showAuthError, redirectToLogin]);

  // Window focus handler for private routes
  useEffect(() => {
    if (!isPrivateRoute) return;

    const handleFocus = () => {
      if (!mountedRef.current || isPublicRoute) return;

      const now = Date.now();
      if (isAuthenticated && now - lastAuthCheckRef.current > 5 * 60 * 1000) {
        refetchUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isPrivateRoute, isAuthenticated, isPublicRoute, refetchUser]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Clear auth flow state
  const clearAuthFlowState = useCallback(() => {
    setAuthFlowState({ requires2FA: false });
  }, []);

  // MUTATIONS
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuthFlowState({
          requires2FA: true,
          tempIdentifier: response.data.identifier,
          otpPurpose: response.data.purpose,
        });
      }
    },
    onError: () => clearAuthFlowState(),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        if (response.data.requires2FA && response.data.identifier) {
          setAuthFlowState({
            requires2FA: true,
            tempIdentifier: response.data.identifier,
            otpPurpose: OtpPurpose.LOGIN,
          });
        } else if (response.data.user) {
          updateAuthState(response.data.user);
          clearAuthFlowState();
          queryClient.invalidateQueries({ queryKey: ['auth'] });
        }
      }
    },
    onError: () => clearAuthFlowState(),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSettled: () => {
      authClientUtils.storage.clear();
      updateAuthState(null);
      clearAuthFlowState();
      queryClient.clear();
      router.push(ROUTES.AUTH.LOGIN);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: VerifyOTPRequest) => authAPI.verifyOTP(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        if (response.data.user && !response.data.resetToken && !response.data.changeToken) {
          updateAuthState(response.data.user);
          clearAuthFlowState();
          queryClient.invalidateQueries({ queryKey: ['auth'] });
          router.push(ROUTES.ADMIN.ROOT);
        } else if (response.data.resetToken) {
          setAuthFlowState(prev => ({ ...prev, requires2FA: false, resetToken: response.data?.resetToken }));
        } else if (response.data.changeToken) {
          setAuthFlowState(prev => ({ ...prev, requires2FA: false, changeToken: response.data?.changeToken }));
        }
      }
    },
    onError: () => setAuthFlowState(prev => ({ ...prev, requires2FA: false })),
  });

  const resendOTPMutation = useMutation({
    mutationFn: (data: ResendOTPRequest) => authAPI.resendOTP(data),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authAPI.forgotPassword(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuthFlowState({
          requires2FA: true,
          tempIdentifier: response.data.identifier,
          otpPurpose: OtpPurpose.FORGOT_PASSWORD,
        });
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authAPI.resetPassword(data),
    onSuccess: (response) => {
      if (response.success) {
        clearAuthFlowState();
        router.push(ROUTES.AUTH.LOGIN);
      }
    },
  });

  const initiateChangePasswordMutation = useMutation({
    mutationFn: (data: InitiateChangePasswordRequest) => authAPI.initiateChangePassword(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuthFlowState({
          requires2FA: true,
          tempIdentifier: response.data.identifier,
          otpPurpose: response.data.purpose,
        });
      }
    },
  });

  const completeChangePasswordMutation = useMutation({
    mutationFn: (data: CompleteChangePasswordRequest) => authAPI.completeChangePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        clearAuthFlowState();
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => authAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: () => authAPI.refreshToken(),
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        updateAuthState(response.data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: () => {
      authClientUtils.storage.clear();
      updateAuthState(null);
      clearAuthFlowState();
    },
  });

  // CONVENIENCE METHODS WITH VALIDATION
  const register = useCallback(async (data: RegisterRequest) => {
    const errors = authClientUtils.validateRegister(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'register');
    }
    return await registerMutation.mutateAsync(data);
  }, [registerMutation]);

  const login = useCallback(async (data: LoginRequest) => {
    return await loginMutation.mutateAsync(data);
  }, [loginMutation]);

  const verifyOTP = useCallback(async (data: VerifyOTPRequest) => {
    const errors = authClientUtils.validateOTP(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'verifyOTP');
    }
    return await verifyOTPMutation.mutateAsync(data);
  }, [verifyOTPMutation]);

  const resendOTP = useCallback(async (data?: Partial<ResendOTPRequest>) => {
    const otpData = {
      identifier: data?.identifier || authFlowState.tempIdentifier || '',
      purpose: data?.purpose || authFlowState.otpPurpose || OtpPurpose.LOGIN,
    };

    if (!otpData.identifier || !otpData.purpose) {
      throw handleAuthError({ message: 'Missing identifier or purpose' }, 'resendOTP');
    }

    return await resendOTPMutation.mutateAsync(otpData);
  }, [resendOTPMutation, authFlowState]);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    const errors = authClientUtils.validateForgotPassword(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'forgotPassword');
    }
    return await forgotPasswordMutation.mutateAsync(data);
  }, [forgotPasswordMutation]);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    const errors = authClientUtils.validateResetPassword(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'resetPassword');
    }
    return await resetPasswordMutation.mutateAsync(data);
  }, [resetPasswordMutation]);

  const initiateChangePassword = useCallback(async (data: InitiateChangePasswordRequest) => {
    const errors = authClientUtils.validateInitiateChangePassword(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'initiateChangePassword');
    }
    return await initiateChangePasswordMutation.mutateAsync(data);
  }, [initiateChangePasswordMutation]);

  const completeChangePassword = useCallback(async (data: CompleteChangePasswordRequest) => {
    const errors = authClientUtils.validateCompleteChangePassword(data);
    if (Object.keys(errors).length > 0) {
      throw handleAuthError({ message: Object.values(errors).join(', ') }, 'completeChangePassword');
    }
    return await completeChangePasswordMutation.mutateAsync(data);
  }, [completeChangePasswordMutation]);

  // Loading state
  const isLoading = isAuthLoading ||
    registerMutation.isPending ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    verifyOTPMutation.isPending ||
    resendOTPMutation.isPending ||
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending ||
    initiateChangePasswordMutation.isPending ||
    completeChangePasswordMutation.isPending ||
    updateProfileMutation.isPending ||
    refreshTokenMutation.isPending;

  return {
    // Core state
    user,
    currentUser,
    isAuthenticated,
    isLoading,
    isFetching,
    authError,

    // Route state
    isPublicRoute,
    isPrivateRoute,
    requiresAuth,

    // Flow state
    requires2FA: authFlowState.requires2FA,
    tempIdentifier: authFlowState.tempIdentifier,
    otpPurpose: authFlowState.otpPurpose,
    resetToken: authFlowState.resetToken,
    changeToken: authFlowState.changeToken,

    // Auth methods
    register,
    login,
    logout: () => logoutMutation.mutateAsync(),
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    initiateChangePassword,
    completeChangePassword,
    updateProfile: (data: UpdateProfileRequest) => updateProfileMutation.mutateAsync(data),
    refreshToken: () => refreshTokenMutation.mutateAsync(),

    // Utility methods
    isAdmin: () => authClientUtils.isAdmin(),
    hasRole: (role: UserRole) => authClientUtils.hasRole(role),
    getUserId: () => authClientUtils.getCurrentUser()?._id || null,
    clearAuthData: () => authClientUtils.storage.clear(),
    forceRefresh: () => refetchUser(),

    // Validation methods
    validateRegister: authClientUtils.validateRegister,
    validateLogin: authClientUtils.validateLogin,
    validateOTP: authClientUtils.validateOTP,
    validateForgotPassword: authClientUtils.validateForgotPassword,
    validateResetPassword: authClientUtils.validateResetPassword,
    validateInitiateChangePassword: authClientUtils.validateInitiateChangePassword,
    validateCompleteChangePassword: authClientUtils.validateCompleteChangePassword,

    // Individual mutation states
    mutations: {
      register: {
        isLoading: registerMutation.isPending,
        error: registerMutation.error,
        data: registerMutation.data,
        isSuccess: registerMutation.isSuccess,
        isError: registerMutation.isError,
        reset: registerMutation.reset,
      },
      login: {
        isLoading: loginMutation.isPending,
        error: loginMutation.error,
        data: loginMutation.data,
        isSuccess: loginMutation.isSuccess,
        isError: loginMutation.isError,
        reset: loginMutation.reset,
      },
      logout: {
        isLoading: logoutMutation.isPending,
        error: logoutMutation.error,
        data: logoutMutation.data,
        isSuccess: logoutMutation.isSuccess,
        isError: logoutMutation.isError,
        reset: logoutMutation.reset,
      },
      verifyOTP: {
        isLoading: verifyOTPMutation.isPending,
        error: verifyOTPMutation.error,
        data: verifyOTPMutation.data,
        isSuccess: verifyOTPMutation.isSuccess,
        isError: verifyOTPMutation.isError,
        reset: verifyOTPMutation.reset,
      },
      resendOTP: {
        isLoading: resendOTPMutation.isPending,
        error: resendOTPMutation.error,
        data: resendOTPMutation.data,
        isSuccess: resendOTPMutation.isSuccess,
        isError: resendOTPMutation.isError,
        reset: resendOTPMutation.reset,
      },
      forgotPassword: {
        isLoading: forgotPasswordMutation.isPending,
        error: forgotPasswordMutation.error,
        data: forgotPasswordMutation.data,
        isSuccess: forgotPasswordMutation.isSuccess,
        isError: forgotPasswordMutation.isError,
        reset: forgotPasswordMutation.reset,
      },
      resetPassword: {
        isLoading: resetPasswordMutation.isPending,
        error: resetPasswordMutation.error,
        data: resetPasswordMutation.data,
        isSuccess: resetPasswordMutation.isSuccess,
        isError: resetPasswordMutation.isError,
        reset: resetPasswordMutation.reset,
      },
      initiateChangePassword: {
        isLoading: initiateChangePasswordMutation.isPending,
        error: initiateChangePasswordMutation.error,
        data: initiateChangePasswordMutation.data,
        isSuccess: initiateChangePasswordMutation.isSuccess,
        isError: initiateChangePasswordMutation.isError,
        reset: initiateChangePasswordMutation.reset,
      },
      completeChangePassword: {
        isLoading: completeChangePasswordMutation.isPending,
        error: completeChangePasswordMutation.error,
        data: completeChangePasswordMutation.data,
        isSuccess: completeChangePasswordMutation.isSuccess,
        isError: completeChangePasswordMutation.isError,
        reset: completeChangePasswordMutation.reset,
      },
      updateProfile: {
        isLoading: updateProfileMutation.isPending,
        error: updateProfileMutation.error,
        data: updateProfileMutation.data,
        isSuccess: updateProfileMutation.isSuccess,
        isError: updateProfileMutation.isError,
        reset: updateProfileMutation.reset,
      },
      refreshToken: {
        isLoading: refreshTokenMutation.isPending,
        error: refreshTokenMutation.error,
        data: refreshTokenMutation.data,
        isSuccess: refreshTokenMutation.isSuccess,
        isError: refreshTokenMutation.isError,
        reset: refreshTokenMutation.reset,
      },
    },
  };
};