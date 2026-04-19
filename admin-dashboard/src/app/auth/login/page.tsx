"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowLeft, Shield, Clock, RefreshCw } from "lucide-react";
import { Header, Input, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@/components";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { authClientUtils } from "@/lib/utils/index";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { OtpPurpose } from "@/lib/types";
import { ROUTES } from "@/lib/consts";

interface LoginFormData {
    email: string;
    password: string;
}

interface OtpData {
    otp: string;
    identifier: string;
    purpose: string;
}

interface FormErrors {
    [key: string]: string;
}

const Login: React.FC = () => {
    const router = useRouter();
    const { login, logout, verifyOTP, resendOTP, mutations, requires2FA, tempIdentifier, otpPurpose, isAuthenticated } = useAuth();

    // Login form state
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });

    // OTP form state
    const [otpData, setOtpData] = useState<OtpData>({
        otp: "",
        identifier: tempIdentifier || "",
        purpose: otpPurpose || OtpPurpose.LOGIN
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    // OTP input refs for better UX
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(ROUTES.ADMIN.ROOT);
        }
    }, [isAuthenticated, router]);

    // Update OTP data when tempIdentifier changes
    useEffect(() => {
        if (tempIdentifier) {
            setOtpData(prev => ({
                ...prev,
                identifier: tempIdentifier,
                purpose: otpPurpose || OtpPurpose.LOGIN
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

    // Handle successful verification
    useEffect(() => {
        if (mutations.verifyOTP.isSuccess && mutations.verifyOTP.data?.success) {
            router.push(ROUTES.ADMIN.ROOT);

        }
    }, [mutations.verifyOTP.isSuccess, mutations.verifyOTP.data, router]);

    const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = authClientUtils.validateLogin(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const res = await login(formData);
            console.log(res)
            if (res.success) {
                if (!requires2FA) {
                    if (res.data?.user?.isAdmin) {
                        router.push(ROUTES.ADMIN.ROOT)
                    }
                    else {
                        logout()
                        toast.error("Admin access required!");
                    }
                } else {
                    toast.success("Please check your email for the verification code.");
                }
            } else {
                toast.error(res.message || "Login failed");
            }
        } catch (err: any) {
            console.error("Login failed:", err.message);
            toast.error(err.message || "Login failed");
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpData.otp.length !== 6) {
            setErrors({ otp: "Please enter a valid 6-digit OTP" });
            return;
        }

        try {
            const res = await verifyOTP({ ...otpData, purpose: OtpPurpose.LOGIN });
            if (res.success) {
                // Success handling is done in useEffect
            } else {
                toast.error(res.message || "Invalid OTP. Please try again.");
            }
        } catch (err: any) {
            console.error("OTP verification failed:", err.message);
            toast.error(err.message || "Invalid OTP. Please try again.");
            setErrors({ otp: err.message || "Invalid OTP. Please try again." });
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) {
            toast.error(`Please wait ${resendCooldown} seconds before requesting a new OTP`);
            return;
        }

        try {
            const res = await resendOTP({
                identifier: tempIdentifier,
                purpose: otpPurpose || OtpPurpose.LOGIN
            });
            if (res.success) {
                toast.success("New OTP sent to your email!");
                setResendCooldown(60); // 1 minute cooldown
                setOtpData(prev => ({ ...prev, otp: "" })); // Clear current OTP
            } else {
                toast.error(res.message || "Failed to resend OTP");
            }
        } catch (err: any) {
            console.error("Resend OTP failed:", err.message);
            toast.error(err.message || "Failed to resend OTP");
        }
    };

    // OTP verification screen
    if (requires2FA && tempIdentifier) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        <div>
                            <Link
                                href={ROUTES.ROOT}
                                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Home
                            </Link>
                        </div>

                        <Card className="card-shadow border-0">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl font-bold font-display">Verify Your Identity</CardTitle>
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
                                            "Verify & Sign In"
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

    // Login form screen
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Back link */}
                    <div>
                        <Link
                            href={ROUTES.ROOT}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </div>

                    <Card className="card-shadow border-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold font-display">Welcome Back</CardTitle>
                            <CardDescription>
                                Sign in to your Quickzon account to continue your journey
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={handleInputChange("email")}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange("password")}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    size="lg"
                                    className="w-full"
                                    disabled={mutations.login.isLoading}
                                >
                                    {mutations.login.isLoading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>

                                {mutations.login.isError && mutations.login.error && (
                                    <p className="text-red-500 text-sm text-center mt-2">
                                        {String(mutations.login.error) || "Login failed"}
                                    </p>
                                )}
                            </form>

                            <div className="mt-6 text-center space-y-4">
                                <Link
                                    href={ROUTES.AUTH.FORGOT_PASSWORD}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Forgot your password?
                                </Link>

                                <div className="border-t border-border pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Don't have an account?{" "}
                                        <Link href={ROUTES.AUTH.REGISTER} className="text-primary hover:underline font-medium">
                                            Create one here
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trust indicators */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Protected by enterprise-grade security
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Login;