"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowLeft, Shield, Clock, RefreshCw, Check } from "lucide-react";
import { Header, Input, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@/components";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { authClientUtils } from "@/lib/utils/index";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { OtpPurpose } from "@/lib/types";
import { ROUTES } from "@/lib/consts";

interface ForgotPasswordFormData {
    email: string;
}

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

interface OtpData {
    otp: string;
    identifier: string;
    purpose: string;
}

interface FormErrors {
    [key: string]: string;
}

const ForgotPassword: React.FC = () => {
    const router = useRouter();
    const { forgotPassword, verifyOTP, resetPassword, resendOTP, mutations, requires2FA, tempIdentifier, otpPurpose, resetToken, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(ROUTES.ROOT);
        }
    }, [isAuthenticated, router]);

    // Form states
    const [emailFormData, setEmailFormData] = useState<ForgotPasswordFormData>({
        email: "",
    });

    const [resetFormData, setResetFormData] = useState<ResetPasswordFormData>({
        newPassword: "",
        confirmPassword: "",
    });

    // OTP form state
    const [otpData, setOtpData] = useState<OtpData>({
        otp: "",
        identifier: tempIdentifier || "",
        purpose: otpPurpose || OtpPurpose.FORGOT_PASSWORD
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);

    // OTP input refs for better UX
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Update OTP data when tempIdentifier changes
    useEffect(() => {
        if (tempIdentifier) {
            setOtpData(prev => ({
                ...prev,
                identifier: tempIdentifier,
                purpose: otpPurpose || OtpPurpose.FORGOT_PASSWORD
            }));
        }
    }, [tempIdentifier, otpPurpose]);

    // Cooldown timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Handle successful password reset
    useEffect(() => {
        if (mutations.resetPassword.isSuccess && mutations.resetPassword.data?.success) {
            setShowSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => {
                router.push(ROUTES.AUTH.LOGIN);
            }, 2000);
        }
    }, [mutations.resetPassword.isSuccess, mutations.resetPassword.data, router]);

    const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFormData(prev => ({ ...prev, email: e.target.value }));
        setErrors(prev => ({ ...prev, email: "" }));
    };

    const handleResetInputChange = (field: keyof ResetPasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetFormData(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const handleOtpChange = (value: string) => {
        // Only allow numeric input and limit to 6 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setOtpData(prev => ({ ...prev, otp: numericValue }));
        setErrors(prev => ({ ...prev, otp: "" }));

        // Auto-focus next input
        if (numericValue.length > 0 && numericValue.length < 6) {
            const nextIndex = numericValue.length;
            if (otpInputRefs.current[nextIndex]) {
                otpInputRefs.current[nextIndex]?.focus();
            }
        }
    };

    const handleOtpInputChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 1) {
            const newOtp = otpData.otp.split('');
            newOtp[index] = numericValue;
            const updatedOtp = newOtp.join('').slice(0, 6);

            setOtpData(prev => ({ ...prev, otp: updatedOtp }));
            setErrors(prev => ({ ...prev, otp: "" }));

            // Auto-focus next input
            if (numericValue && index < 5) {
                otpInputRefs.current[index + 1]?.focus();
            }
            // Auto-focus previous input on backspace
            if (!numericValue && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpData.otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = authClientUtils.validateForgotPassword(emailFormData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await forgotPassword(emailFormData);
            if (res.success) {
                toast.success("Reset code sent to your email!");
                setResendCooldown(60); // 1 minute cooldown
            } else {
                toast.error(res.message || "Failed to send reset code");
            }
        } catch (err: any) {
            console.error("Forgot password failed:", err.message);
            toast.error(err.message || "Failed to send reset code");
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpData.otp.length !== 6) {
            setErrors({ otp: "Please enter a valid 6-digit OTP" });
            return;
        }

        try {
            const res = await verifyOTP({ ...otpData, purpose: OtpPurpose.FORGOT_PASSWORD });
            if (res.success) {
                toast.success("Code verified! Please set your new password.");
            } else {
                toast.error(res.message || "Invalid OTP. Please try again.");
            }
        } catch (err: any) {
            console.error("OTP verification failed:", err.message);
            toast.error(err.message || "Invalid OTP. Please try again.");
            setErrors({ otp: err.message || "Invalid OTP. Please try again." });
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (resetFormData.newPassword !== resetFormData.confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        const validationErrors = authClientUtils.validateResetPassword({
            resetToken: resetToken || "",
            newPassword: resetFormData.newPassword,
            identifier: tempIdentifier || emailFormData.email
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await resetPassword({
                resetToken: resetToken || "",
                newPassword: resetFormData.newPassword,
                identifier: tempIdentifier || emailFormData.email
            });
            if (res.success) {
                // Success handling is done in useEffect
            } else {
                toast.error(res.message || "Failed to reset password");
            }
        } catch (err: any) {
            console.error("Password reset failed:", err.message);
            toast.error(err.message || "Failed to reset password");
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before requesting a new code`);
            return;
        }

        try {
            const res = await resendOTP({
                identifier: tempIdentifier || emailFormData.email,
                purpose: OtpPurpose.FORGOT_PASSWORD
            });
            if (res.success) {
                toast.success("New code sent to your email!");
                setResendCooldown(60); // 1 minute cooldown
                setOtpData(prev => ({ ...prev, otp: "" })); // Clear current OTP
            } else {
                toast.error(res.message || "Failed to resend code");
            }
        } catch (err: any) {
            console.error("Resend OTP failed:", err.message);
            toast.error(err.message || "Failed to resend code");
        }
    };

    // Success screen
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <Card className="card-shadow border-0 text-center">
                            <CardContent className="p-8">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold font-display mb-2">Password Reset!</h2>
                                    <p className="text-muted-foreground">
                                        Your password has been successfully reset. Redirecting to login...
                                    </p>
                                </div>
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    // Reset password form screen (when we have resetToken)
    if (resetToken) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <div className="mb-8">
                            <Link
                                href={ROUTES.AUTH.LOGIN}
                                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>

                        <Card className="card-shadow border-0">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold font-display">Set New Password</CardTitle>
                                <CardDescription>
                                    Enter your new password below
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleResetSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={resetFormData.newPassword}
                                                onChange={handleResetInputChange("newPassword")}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={resetFormData.confirmPassword}
                                                onChange={handleResetInputChange("confirmPassword")}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="w-full"
                                        disabled={mutations.resetPassword.isLoading}
                                    >
                                        {mutations.resetPassword.isLoading ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>

                                    {mutations.resetPassword.isError && mutations.resetPassword.error && (
                                        <p className="text-red-500 text-sm text-center mt-2">
                                            {String(mutations.resetPassword.error) || "Password reset failed"}
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    // OTP verification screen (when we need to verify the reset code)
    if (requires2FA && tempIdentifier && otpPurpose === OtpPurpose.FORGOT_PASSWORD) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <div className="mb-8">
                            <Link
                                href={ROUTES.AUTH.LOGIN}
                                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>

                        <Card className="card-shadow border-0">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold font-display">Verify Reset Code</CardTitle>
                                <CardDescription>
                                    We've sent a 6-digit code to<br />
                                    <span className="font-medium text-foreground">{tempIdentifier}</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-center block">Enter verification code</Label>

                                        {/* Individual OTP inputs */}
                                        <div className="flex justify-center space-x-2">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <Input
                                                    key={index}
                                                    ref={el => { otpInputRefs.current[index] = el }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-primary"
                                                    value={otpData.otp[index] || ''}
                                                    onChange={(e) => handleOtpInputChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                />
                                            ))}
                                        </div>

                                        {/* Single input fallback */}
                                        <div className="mt-4">
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="Or enter 6-digit code here"
                                                value={otpData.otp}
                                                onChange={(e) => handleOtpChange(e.target.value)}
                                                className="text-center text-lg tracking-widest"
                                                maxLength={6}
                                            />
                                        </div>

                                        {errors.otp && <p className="text-sm text-red-500 text-center">{errors.otp}</p>}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="w-full"
                                        disabled={mutations.verifyOTP.isLoading || otpData.otp.length !== 6}
                                    >
                                        {mutations.verifyOTP.isLoading ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify Code"
                                        )}
                                    </Button>

                                    {mutations.verifyOTP.isError && mutations.verifyOTP.error && (
                                        <p className="text-red-500 text-sm text-center mt-2">
                                            {String(mutations.verifyOTP.error) || "Verification failed"}
                                        </p>
                                    )}
                                </form>

                                <div className="mt-6 text-center space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        Didn't receive the code?
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || mutations.resendOTP.isLoading}
                                        className="text-primary"
                                    >
                                        {mutations.resendOTP.isLoading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : resendCooldown > 0 ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-2" />
                                                Resend in {resendCooldown}s
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Resend Code
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-xs text-muted-foreground">
                                        Check your spam folder if you don't see the email
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    // Email request form screen (initial step)
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="mb-8">
                        <Link
                            href={ROUTES.AUTH.LOGIN}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>

                    <Card className="card-shadow border-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold font-display">Forgot Password?</CardTitle>
                            <CardDescription>
                                Enter your email address and we'll send you a code to reset your password
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={emailFormData.email}
                                            onChange={handleEmailInputChange}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    size="lg"
                                    className="w-full"
                                    disabled={mutations.forgotPassword.isLoading}
                                >
                                    {mutations.forgotPassword.isLoading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Sending Code...
                                        </>
                                    ) : (
                                        "Send Reset Code"
                                    )}
                                </Button>

                                {mutations.forgotPassword.isError && mutations.forgotPassword.error && (
                                    <p className="text-red-500 text-sm text-center mt-2">
                                        {String(mutations.forgotPassword.error) || "Failed to send reset code"}
                                    </p>
                                )}
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Remember your password?{" "}
                                    <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;