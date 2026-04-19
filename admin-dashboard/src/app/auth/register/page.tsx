"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, User, ArrowLeft, CheckCircle, Shield, Clock, RefreshCw, Check } from "lucide-react";
import { Header, Checkbox, Input, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from "@/components";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { authClientUtils } from "@/lib/utils/index";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { OtpPurpose } from "@/lib/types";
import { ROUTES } from "@/lib/consts";

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
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

const Register: React.FC = () => {
    const router = useRouter();
    const { register, verifyOTP, resendOTP, mutations, requires2FA, tempIdentifier, otpPurpose, isAuthenticated } = useAuth();

    // Registration form state
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // OTP form state
    const [otpData, setOtpData] = useState<OtpData>({
        otp: "",
        identifier: tempIdentifier || "",
        purpose: otpPurpose || OtpPurpose.REGISTER
    });

    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);

    // OTP input refs for better UX
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(ROUTES.ROOT);
        }
    }, [isAuthenticated, router]);

    // Update OTP data when tempIdentifier changes
    useEffect(() => {
        if (tempIdentifier) {
            setOtpData(prev => ({
                ...prev,
                identifier: tempIdentifier,
                purpose: otpPurpose || OtpPurpose.REGISTER
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
            setShowSuccess(true);
            toast.success("Account verified successfully!");
            setTimeout(() => {
                router.push(ROUTES.ROOT);
            }, 2000);
        }
    }, [mutations.verifyOTP.isSuccess, mutations.verifyOTP.data, router]);

    const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (!agreedToTerms) {
            setErrors(prev => ({ ...prev, terms: "You must agree to the terms" }));
            return;
        }

        const validationErrors = authClientUtils.validateRegister(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            console.log(errors)
            return;
        }

        try {
            const res = await register(formData);
            if (res.success) {
                toast.success(res.message || "Registration successful! Please check your email for the OTP.");
            } else {
                toast.error(res.message || "Registration failed");
            }
        } catch (err: any) {
            console.error("Registration failed:", err.message);
            toast.error(err.message || "Registration failed");
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otpData.otp.length !== 6) {
            setErrors({ otp: "Please enter a valid 6-digit OTP" });
            return;
        }

        try {
            const res = await verifyOTP({ ...otpData, purpose: OtpPurpose.REGISTER });
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
                purpose: otpPurpose || OtpPurpose.REGISTER
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

    const benefits = [
        "Access to all business tools and services",
        "24/7 customer support",
        "Secure and encrypted platform",
        "Expert financial guidance",
    ];

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
                                    <h2 className="text-2xl font-bold font-display mb-2">Account Verified!</h2>
                                    <p className="text-muted-foreground">
                                        Your account has been successfully verified. Redirecting to dashboard...
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

    // OTP verification screen
    if (requires2FA && tempIdentifier) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto">
                        <div className="mb-8">
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
                                <CardTitle className="text-2xl font-bold font-display">Verify Your Email</CardTitle>
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
                                            "Verify Email"
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

    // Registration form screen
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href={ROUTES.ROOT}
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Benefits column */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold font-display mb-4">Join Quickzon Today</h1>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    Start your journey to financial success with our trusted platform
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">What you'll get:</h3>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                            <span className="text-muted-foreground">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                                <h4 className="font-semibold text-primary mb-2">Trusted by thousands</h4>
                                <p className="text-sm text-muted-foreground">
                                    Join our community of successful entrepreneurs and business professionals
                                </p>
                            </div>
                        </div>

                        {/* Form column */}
                        <Card className="card-shadow border-0">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold font-display">Create Your Account</CardTitle>
                                <CardDescription>Get started in just a few minutes</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="firstName"
                                                    type="text"
                                                    placeholder="John"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange("firstName")}
                                                    className="pl-10"
                                                />
                                            </div>
                                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                type="text"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={handleInputChange("lastName")}
                                            />
                                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                                        </div>
                                    </div>

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
                                            />
                                        </div>
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange("confirmPassword")}
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="terms"
                                            checked={agreedToTerms}
                                            onCheckedChange={(checked: boolean) => setAgreedToTerms(!!checked)}
                                        />
                                        <Label htmlFor="terms" className="text-sm">
                                            I agree to the{" "}
                                            <Link href="/terms" className="text-primary hover:underline">
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link href="/privacy" className="text-primary hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </Label>
                                    </div>
                                    {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}

                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="w-full"
                                        disabled={mutations.register.isLoading}
                                    >
                                        {mutations.register.isLoading ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                Creating Account...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>

                                    {mutations.register.isError && mutations.register.error && (
                                        <p className="text-red-500 text-sm mt-2 text-center">
                                            {String(mutations.register.error) || "Registration failed"}
                                        </p>
                                    )}
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline font-medium">
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;