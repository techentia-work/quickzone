"use client";
import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks';
import { OtpPurpose, LoginRequest, RegisterRequest, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest, InitiateChangePasswordRequest, CompleteChangePasswordRequest } from '@/lib/types';
import BaseModal from './BaseModal';
import OTPInput from '../input/OTPInput';
import { FormInput, FormSubmitButton } from '../ui';
import { authClientUtils } from '@/lib/utils/auth.client.utils';

// Theme colors: #37a279 (green), #FFC908 (yellow), white
const themeClasses = {
    primary: 'bg-[#37a279] hover:bg-[#2f8967] text-white',
    secondary: 'bg-[#FFC908] hover:bg-[#e6b507] text-gray-900',
    primaryRing: 'focus:ring-[#37a279] focus:border-[#37a279]',
    primaryText: 'text-[#37a279]',
    primaryBorder: 'border-[#37a279]',
    secondaryText: 'text-[#FFC908]',
};

// Modal Props Interfaces
interface LoginModalProps {
    isOpen: boolean;
    closeModal: () => void;
    openRegisterModal: () => void;
    openForgotPasswordModal: () => void;
}

interface RegisterModalProps {
    isOpen: boolean;
    closeModal: () => void;
    openLoginModal: () => void;
}

interface ForgotPasswordModalProps {
    isOpen: boolean;
    closeModal: () => void;
    openLoginModal: () => void;
}

interface ResetPasswordModalProps {
    isOpen: boolean;
    closeModal: () => void;
    openLoginModal: () => void;
    resetToken: string;
    identifier: string;
}

interface ChangePasswordModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

interface FormErrors {
    [key: string]: string;
}

// Login Modal
export function LoginModal({ isOpen, closeModal, openRegisterModal, openForgotPasswordModal }: LoginModalProps) {
    const { login, isLoggingIn, verifyOTP } = useAuth();
    const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showOTP, setShowOTP] = useState<boolean>(false);
    const [otp, setOTP] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const loginPayload: LoginRequest = { email: formData.email, password: formData.password };

        const errors = authClientUtils.validateLogin(loginPayload);

        if (Object.keys(errors).length) {
            setErrors(errors);
            return;
        }

        try {
            const result = await login(loginPayload);

            if (result?.data?.requires2FA) {
                setShowOTP(true);
            } else if (result?.success) {
                closeModal();
                setFormData({ email: '', password: '' });
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'Login failed' });
        }
    };

    const handleOTPVerify = async () => {
        const identifier = formData.email || '';
        const otpPayload: VerifyOTPRequest = {
            identifier,
            otp,
            purpose: OtpPurpose.LOGIN
        };

        try {
            await verifyOTP(otpPayload);
            closeModal();
            setShowOTP(false);
            setFormData({ email: '', password: '' });
        } catch (error: any) {
            setErrors({ otp: error.message || 'OTP verification failed' });
        }
    };

    if (showOTP) {
        return (
            <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    Enter the 6-digit code sent to {formData.email}
                </p>

                <OTPInput value={otp} onChange={setOTP} length={6} error={errors.otp} />

                <button
                    onClick={handleOTPVerify}
                    disabled={otp.length !== 6}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${themeClasses.primary}`}
                >
                    Verify & Login
                </button>
            </BaseModal>
        );
    }

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back Quickzone</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({
                        ...formData,
                        email: e.target.value
                    })}
                    placeholder="you@example.com"
                    error={errors.email}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        closeModal();
                        openForgotPasswordModal();
                    }}
                    className={`text-sm hover:underline ${themeClasses.primaryText}`}
                >
                    Forgot password?
                </button>

                {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

                <FormSubmitButton
                    isLoading={isLoggingIn}
                    loadingText="Logging in..."
                    className={`w-full  bg-emerald-600 hover:bg-emerald-600`}
                >
                    Login
                </FormSubmitButton>
            </form>

            <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <button
                    onClick={() => {
                        closeModal();
                        openRegisterModal();
                    }}
                    className={`font-semibold hover:underline ${themeClasses.primaryText}`}
                >
                    Sign up
                </button>
            </p>
        </BaseModal>
    );
}

// Register Modal
export function RegisterModal({
    isOpen,
    closeModal,
    openLoginModal
}: RegisterModalProps) {
    const { register, isRegistering, verifyOTP } = useAuth();
    const [formData, setFormData] = useState<RegisterRequest>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [showOTP, setShowOTP] = useState<boolean>(false);
    const [otp, setOTP] = useState<string>('');
    const [identifier, setIdentifier] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const errors = authClientUtils.validateRegister({ ...formData, confirmPassword: confirmPassword });
        if (Object.keys(errors).length) {
            setErrors(errors);
            return;
        }

        try {
            const registerPayload: RegisterRequest = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            };

            const result = await register(registerPayload);

            if (result?.success) {
                setIdentifier(result.data?.identifier || formData.email!);
                setShowOTP(true);
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'Registration failed' });
        }
    };

    const handleOTPVerify = async () => {
        try {
            const otpPayload: VerifyOTPRequest = {
                identifier,
                otp,
                purpose: OtpPurpose.REGISTER
            };

            const res = await verifyOTP(otpPayload);
            if (res.success || res.message === "Invalid OTP. 0 attempts remaining.") {
                closeModal();
                setShowOTP(false);
                setOTP("")
                setFormData({ firstName: '', lastName: '', email: '', password: '' });
            } 
        } catch (error: any) {
            setErrors({ otp: error.message || 'OTP verification failed' });
        }
    };

    if (showOTP) {
        return (
            <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Verify Your Account</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">Enter the 6-digit code sent to {identifier}</p>

                <OTPInput value={otp} onChange={setOTP} length={6} error={errors.otp} />

                <button
                    onClick={handleOTPVerify}
                    disabled={otp.length !== 6}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${themeClasses.primary}`}
                >
                    Verify & Continue
                </button>
            </BaseModal>
        );
    }

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        error={errors.firstName}
                    />

                    <FormInput
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        error={errors.lastName}
                    />
                </div>

                <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({
                        ...formData,
                        email: e.target.value
                    })}
                    placeholder="you@example.com"
                    error={errors.email}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

                <FormSubmitButton
                    isLoading={isRegistering}
                    loadingText="Creating account..."
                    className={`w-full bg-emerald-600 hover:bg-emerald-600`}
                >
                    Create Account
                </FormSubmitButton>
            </form>

            <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <button
                    onClick={() => {
                        closeModal();
                        openLoginModal();
                    }}
                    className={`font-semibold hover:underline ${themeClasses.primaryText}`}
                >
                    Login
                </button>
            </p>
        </BaseModal>
    );
}

// Forgot Password Modal
export function ForgotPasswordModal({
    isOpen,
    closeModal,
    openLoginModal
}: ForgotPasswordModalProps) {
    const { forgotPassword, verifyOTP } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showOTP, setShowOTP] = useState<boolean>(false);
    const [otp, setOTP] = useState<string>('');
    const [resetToken, setResetToken] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        const forgotPasswordPayload: ForgotPasswordRequest = { email };

        const errors = authClientUtils.validateForgotPassword(forgotPasswordPayload);
        if (Object.keys(errors).length) {
            setErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            const result = await forgotPassword(forgotPasswordPayload);

            if (result?.success) {
                setShowOTP(true);
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to send reset code' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPVerify = async () => {
        const otpPayload: VerifyOTPRequest = {
            identifier: email,
            otp,
            purpose: OtpPurpose.FORGOT_PASSWORD
        };

        const errors = authClientUtils.validateOTP(otpPayload);
        if (Object.keys(errors).length) {
            setErrors(errors);
            return;
        }
        try {
            const result = await verifyOTP(otpPayload);

            if (result?.data?.resetToken) {
                setResetToken(result.data.resetToken);
            }
        } catch (error: any) {
            setErrors({ otp: error.message || 'OTP verification failed' });
        }
    };

    const handleCloseModal = () => {
        closeModal();
        setShowOTP(false);
    };

    if (resetToken) {
        return (
            <ResetPasswordModal
                isOpen={isOpen}
                closeModal={handleCloseModal}
                openLoginModal={openLoginModal}
                resetToken={resetToken}
                identifier={email}
            />
        );
    }

    if (showOTP) {
        return (
            <BaseModal isOpen={isOpen} closeModal={handleCloseModal} className="bg-white p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">Enter the 6-digit code sent to {email}</p>

                <OTPInput value={otp} onChange={setOTP} length={6} error={errors.otp} />

                <button
                    onClick={handleOTPVerify}
                    disabled={otp.length !== 6}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${themeClasses.primary}`}
                >
                    Verify OTP
                </button>
            </BaseModal>
        );
    }

    return (
        <BaseModal isOpen={isOpen} closeModal={handleCloseModal} className="bg-white p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    error={errors.email}
                />

                {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

                <FormSubmitButton
                    isLoading={isLoading}
                    loadingText="Sending..."
                    className={`w-full bg-emerald-600 hover:bg-emerald-600`}
                >
                    Send Reset Code
                </FormSubmitButton>
            </form>

            <p className="text-center text-gray-600 mt-6">
                Remember your password?{' '}
                <button
                    onClick={() => {
                        handleCloseModal();
                        openLoginModal();
                    }}
                    className={`font-semibold hover:underline ${themeClasses.primaryText}`}
                >
                    Login
                </button>
            </p>
        </BaseModal>
    );
}

// Reset Password Modal
export function ResetPasswordModal({
    isOpen,
    closeModal,
    openLoginModal,
    resetToken,
    identifier
}: ResetPasswordModalProps) {
    const { resetPassword } = useAuth();
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const resetPasswordPayload: ResetPasswordRequest = {
            resetToken,
            newPassword,
            identifier
        };

        const errors = authClientUtils.validateResetPassword({ ...resetPasswordPayload, confirmPassword });

        if (Object.keys(errors).length) {
            setErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(resetPasswordPayload);
            closeModal();
            openLoginModal();
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to reset password' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

                <FormSubmitButton
                    isLoading={isLoading}
                    loadingText="Resetting..."
                    className={`w-full ${themeClasses.primary}`}
                >
                    Reset Password
                </FormSubmitButton>
            </form>
        </BaseModal>
    );
}

// Change Password Modal
export function ChangePasswordModal({
    isOpen,
    closeModal
}: ChangePasswordModalProps) {
    const { initiateChangePassword, completeChangePassword, verifyOTP } = useAuth();
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showOTP, setShowOTP] = useState<boolean>(false);
    const [otp, setOTP] = useState<string>('');
    const [identifier, setIdentifier] = useState<string>('');

    const handleInitiate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const errors = authClientUtils.validateInitiateChangePassword({ currentPassword, newPassword, confirmPassword });
        if (Object.keys(errors).length) {
            setErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const initiatePayload: InitiateChangePasswordRequest = {
                currentPassword
            };

            const result = await initiateChangePassword(initiatePayload);

            if (result?.success) {
                setIdentifier(result.data?.identifier || '');
                setShowOTP(true);
            }
        } catch (error: any) {
            setErrors({ submit: error.message || 'Failed to initiate password change' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPVerify = async () => {
        try {
            const otpPayload: VerifyOTPRequest = {
                identifier,
                otp,
                purpose: OtpPurpose.CHANGE_PASSWORD
            };

            const result = await verifyOTP(otpPayload);

            if (result?.data?.changeToken) {
                const completePayload: CompleteChangePasswordRequest = {
                    identifier,
                    newPassword,
                    changeToken: result.data.changeToken
                };

                const res = await completeChangePassword(completePayload);
                if (res.success) {
                    closeModal();
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (error: any) {
            setErrors({ otp: error.message || 'OTP verification failed' });
        } finally {
            setShowOTP(false);
        }
    };

    if (showOTP) {
        return (
            <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">Enter the 6-digit code sent to {identifier}</p>

                <OTPInput value={otp} onChange={setOTP} length={6} error={errors.otp} />

                <button
                    onClick={handleOTPVerify}
                    disabled={otp.length !== 6}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${themeClasses.primary}`}
                >
                    Verify & Change Password
                </button>
            </BaseModal>
        );
    }

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} className="bg-white p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleInitiate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${themeClasses.primaryRing} ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

                <FormSubmitButton
                    isLoading={isLoading}
                    loadingText="Changing password..."
                    className={`w-full ${themeClasses.primary}`}
                >
                    Change Password
                </FormSubmitButton>
            </form>
        </BaseModal>
    );
}