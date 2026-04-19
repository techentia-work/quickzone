// @/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthRequest, ApiResponse, AppError, UserRole, UserAccountStatus, OtpPurpose } from '../../lib/types/index';
import mongoose from 'mongoose';
import { OTP, User, Wallet } from '../../models/index';
import { emailUtils } from '../../lib/utils/email/email.utils';
import { jwtUtils } from '../../lib/utils/token/token.utils';


export const authController = {
    async me(req: AuthRequest, res: Response) {
        const userData = await User.findById(req.user?._id);

        if (!userData) {
            throw new AppError("User not found", 404);
        }

        res.status(200).json({ success: true, message: "User data retrieved successfully", data: userData });
    },

    async phoneLoginOrRegister(req: Request, res: Response) {

    },

    async register(req: AuthRequest, res: Response) {
        const { firstName, lastName, email, phone, password, role = UserRole.USER } = req.body;
        console.log("Register request:", { firstName, lastName, email, phone, role });

        if (!email && !phone) {
            throw new AppError("Either email or phone is required", 400);
        }

        const identifier = (email ? email.toLowerCase() : phone) ?? "";

        const existingUser = email
            ? await User.findByEmail(identifier)
            : await User.findByPhone(phone!);

        if (existingUser) {
            const field = email ? "Email" : "Phone number";
            throw new AppError(`${field} already registered`, 400);
        }

        if (phone && !email) {
            return res.status(200).json({
                success: true,
                message: "Ready for phone verification",
                data: {
                    identifier: phone,
                    type: 'phone',
                    purpose: 'register'
                }
            });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 12);

        await OTP.deleteMany({ identifier, purpose: OtpPurpose.REGISTER });

        const newOtp = await new OTP({
            identifier,
            otp: hashedOtp,
            purpose: OtpPurpose.REGISTER,
            expiresAt,
            isVerified: false,
            attempts: 0,
            tempUserData: {
                firstName,
                lastName,
                email: email ? email.toLowerCase() : undefined,
                phone,
                password: hashedPassword,
                role
            }
        }).save();

        console.log("OTP created:", newOtp);

        if (email) {
            await emailUtils.sendOTP(identifier, otp, "register");
        } else {
            console.log(`📱 SMS OTP for ${phone}: ${otp}`);
        }

        res.status(201).json({
            success: true,
            message: `Registration initiated. Please verify your ${email ? 'email' : 'phone'} with the OTP sent.`,
            data: {
                identifier,
                purpose: OtpPurpose.REGISTER,
                verificationType: email ? 'email' : 'phone'
            }
        });
    },

    async verifyOTP(req: AuthRequest, res: Response) {
        const { identifier, otp, purpose } = req.body;
        console.log("Verify OTP request:", { identifier, purpose });

        const otpRecord = await OTP.findOne({
            identifier: identifier.toLowerCase(),
            purpose,
            isVerified: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            throw new AppError("Invalid or expired OTP", 400);
        }

        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            throw new AppError("Too many failed attempts. Please request a new OTP.", 429);
        }

        const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);

        if (!isValidOTP) {
            await OTP.updateOne(
                { _id: otpRecord._id },
                { $inc: { attempts: 1 } }
            );
            throw new AppError(`Invalid OTP. ${5 - (otpRecord.attempts + 1)} attempts remaining.`, 400);
        }

        await OTP.updateOne(
            { _id: otpRecord._id },
            { $set: { isVerified: true } }
        );

        let result: any = {};

        switch (purpose) {
            case OtpPurpose.REGISTER:
                result = await authController._completeRegistration(otpRecord, res);
                break;
            case OtpPurpose.LOGIN:
                result = await authController._completeLogin(otpRecord, res);
                break;
            case OtpPurpose.FORGOT_PASSWORD:
                result = await authController._prepareForgotPassword(otpRecord);
                break;
            case OtpPurpose.CHANGE_PASSWORD:
                result = await authController._prepareChangePassword(otpRecord);
                break;
            default:
                throw new AppError("Invalid OTP purpose", 400);
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json(result);
    },

    async resendOTP(req: AuthRequest, res: Response) {
        const { identifier, purpose } = req.body;
        console.log("Resend OTP request:", { identifier, purpose });

        const existingOTP = await OTP.findOne({ identifier: identifier.toLowerCase(), purpose });

        if (!existingOTP) {
            throw new AppError("No pending OTP request found", 404);
        }

        const lastCreated = existingOTP.createdAt || new Date(0);
        const cooldownPeriod = 60 * 1000;

        if (new Date().getTime() - lastCreated.getTime() < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - (new Date().getTime() - lastCreated.getTime())) / 1000);
            throw new AppError(`Please wait ${remainingTime} seconds before requesting a new OTP`, 429);
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.updateOne(
            { _id: existingOTP._id },
            {
                $set: {
                    otp: hashedOtp,
                    expiresAt,
                    attempts: 0,
                    isVerified: false,
                    createdAt: new Date()
                }
            }
        );

        const isEmail = identifier.includes('@');
        if (isEmail) {
            await emailUtils.sendOTP(identifier.toLowerCase(), otp, purpose);
        } else {
            console.log(`📱 SMS OTP for ${identifier}: ${otp}`);
        }

        res.status(200).json({
            success: true,
            message: `New OTP sent to your ${isEmail ? 'email' : 'phone'}`,
            data: {
                identifier,
                purpose,
                verificationType: isEmail ? 'email' : 'phone'
            }
        });
    },

    async login(req: AuthRequest, res: Response) {
        const { email, phone, password } = req.body;

        if (!email && !phone) {
            throw new AppError("Either email or phone is required", 400);
        }

        const identifier = (email ? email.toLowerCase() : phone) ?? "";

        const user = email
            ? await User.findByEmail(identifier).select('+password')
            : await User.findByPhone(phone!).select('+password');

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        if (user.status === UserAccountStatus.SUSPENDED) {
            throw new AppError("Account suspended. Please contact support.", 403);
        }

        if (user.status === UserAccountStatus.INACTIVE) {
            throw new AppError("Account inactive. Please contact support.", 403);
        }

        if (!user.isActive) {
            throw new AppError("Account deactivated", 403);
        }

        if (user.isLocked) {
            throw new AppError("Account temporarily locked due to multiple failed attempts", 423);
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            await authController._handleFailedLogin(user);
            throw new AppError("Invalid credentials", 401);
        }

        await User.updateOne(
            { _id: user._id },
            {
                $unset: {
                    'metadata.failedLoginAttempts': 1,
                    'metadata.lockUntil': 1,
                    'metadata.lastFailedLoginAt': 1
                }
            }
        );

        if (user.metadata?.twoFactorEnabled) {
            const result = await authController._initiate2FA(user, res);
            return res.status(200).json(result);
        }

        const result = await authController._completeDirectLogin(user, res);
        res.status(200).json(result);
    },

    async forgotPassword(req: AuthRequest, res: Response) {
        const { email } = req.body;
        console.log("Forgot password request for email:", email);

        const successResponse = {
            success: true,
            message: "If an account with this email exists, a password reset OTP has been sent.",
            data: { email }
        };

        const user = await User.findByEmail(email.toLowerCase());
        if (!user) {
            console.log("No user found for email:", email);
            return res.status(200).json(successResponse);
        }

        if (user.status === UserAccountStatus.SUSPENDED || !user.isActive) {
            console.log("User account is suspended or inactive:", user._id);
            return res.status(200).json(successResponse);
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.deleteMany({
            identifier: email.toLowerCase(),
            purpose: OtpPurpose.FORGOT_PASSWORD
        });

        const otpRecord = await new OTP({
            identifier: email.toLowerCase(),
            otp: hashedOtp,
            purpose: OtpPurpose.FORGOT_PASSWORD,
            expiresAt,
            isVerified: false,
            attempts: 0,
            tempUserData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: ''
            }
        }).save();

        console.log("Forgot password OTP created:", otpRecord);

        await emailUtils.sendOTP(email.toLowerCase(), otp, "forgot_password");

        res.status(200).json(successResponse);
    },

    async resetPassword(req: AuthRequest, res: Response) {
        const { resetToken, newPassword, identifier } = req.body;
        console.log("Reset password request:", { identifier, resetToken });

        const user = await User.findByEmail(identifier.toLowerCase());
        console.log("User found:", user ? user._id : "No user found");

        if (!user) {
            throw new AppError("Invalid reset request", 400);
        }

        console.log("Stored resetToken:", user.metadata?.passwordResetToken);
        console.log("Received resetToken:", resetToken);
        console.log("Token expiry:", user.metadata?.passwordResetExpiry);
        console.log("Current time:", new Date());

        if (!user.metadata?.passwordResetToken || user.metadata.passwordResetToken !== resetToken) {
            throw new AppError("Invalid or expired reset token", 400);
        }

        const tokenExpiry = user.metadata?.passwordResetExpiry;
        if (!tokenExpiry || new Date() > tokenExpiry) {
            throw new AppError("Reset token expired", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const updateResult = await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    'metadata.passwordChangedAt': new Date(),
                },
                $unset: {
                    'metadata.passwordResetToken': 1,
                    'metadata.passwordResetExpiry': 1,
                    'metadata.failedLoginAttempts': 1,
                    'metadata.lockUntil': 1,
                }
            }
        );
        console.log("Password update result:", updateResult);

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: { email: identifier }
        });
    },

    async initiateChangePassword(req: AuthRequest, res: Response) {
        const { currentPassword } = req.body;

        const tokenPayload = await jwtUtils.verifyRequestToken(req);
        const user = await User.findById(tokenPayload._id).select('+password');

        if (!user) {
            throw new AppError("User not found", 404);
        }

        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            throw new AppError("Current password is incorrect", 400);
        }

        const identifier = user.email || user.phone!;

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.deleteMany({
            identifier,
            purpose: OtpPurpose.CHANGE_PASSWORD
        });

        await new OTP({
            identifier,
            otp: hashedOtp,
            purpose: OtpPurpose.CHANGE_PASSWORD,
            expiresAt,
            isVerified: false,
            attempts: 0,
            tempUserData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: ''
            }
        }).save();

        if (user.email) {
            await emailUtils.sendOTP(user.email.toLowerCase(), otp, "change_password");
        } else {
            console.log(`📱 SMS OTP for ${user.phone}: ${otp}`);
        }

        res.status(200).json({
            success: true,
            message: `OTP sent to your ${user.email ? 'email' : 'phone'} for password change verification`,
            data: {
                identifier,
                purpose: OtpPurpose.CHANGE_PASSWORD,
                verificationType: user.email ? 'email' : 'phone'
            }
        });
    },

    async completeChangePassword(req: AuthRequest, res: Response) {
        const { changeToken, newPassword, identifier } = req.body;

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { phone: identifier }
            ],
            isDeleted: false
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (!user.metadata?.passwordChangeToken || user.metadata.passwordChangeToken !== changeToken) {
            throw new AppError("Invalid or expired change token", 400);
        }

        const tokenExpiry = user.metadata?.passwordChangeExpiry;
        if (!tokenExpiry || new Date() > tokenExpiry) {
            throw new AppError("Change token expired", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    'metadata.passwordChangedAt': new Date(),
                },
                $unset: {
                    'metadata.passwordChangeToken': 1,
                    'metadata.passwordChangeExpiry': 1,
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully. Please login with your new password.",
            data: null
        });
    },

    async logout(req: AuthRequest, res: Response) {
        jwtUtils.clearAuthCookie(res);

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
            data: null
        });
    },

    // Helper methods
    async _completeRegistration(otpRecord: any, res?: Response): Promise<any> {
        const { firstName, lastName, email, phone, password, role } = otpRecord.tempUserData;
        console.log("Completing registration for:", { email, phone });

        const newUser = await new User({
            firstName,
            lastName,
            email: email ? email.toLowerCase() : undefined,
            phone: phone ? `+91${phone}` : undefined,
            password,
            role: role || UserRole.USER,
            status: UserAccountStatus.ACTIVE,
            isActive: true,
            isEmailVerified: !!email,
            isPhoneVerified: !!phone,
            metadata: {
                twoFactorEnabled: false,
                emailVerified: !!email,
                phoneVerified: !!phone,
                preferences: {
                    notifications: {
                        email: true,
                        sms: true,
                        push: true
                    }
                }
            }
        }).save();

        const token = jwtUtils.generateToken({
            _id: (newUser._id as mongoose.Types.ObjectId).toString(),
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            firstName: newUser.firstName,
            fullName: newUser.firstName + newUser.lastName,
            isAdmin: newUser.role === UserRole.ADMIN
        });

        if (res) {
            jwtUtils.setAuthCookie(res, token);
        }

        await Wallet.create({
            ownerId: newUser._id,
            ownerName: newUser.firstName,
            ownerModel: newUser.role
        })

        return {
            success: true,
            message: "Registration completed successfully. You can now login.",
            data: {
                user: {
                    id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    isAdmin: newUser.role === UserRole.ADMIN,
                    isEmailVerified: newUser.isEmailVerified,
                    isPhoneVerified: newUser.isPhoneVerified,
                    lastLogin: newUser.lastLogin
                }
            }
        };
    },

    async _completeLogin(otpRecord: any, res: Response): Promise<any> {
        const user = await User.findOne({
            $or: [
                { email: otpRecord.identifier.toLowerCase() },
                { phone: otpRecord.identifier }
            ],
            isDeleted: false
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return await authController._completeDirectLogin(user, res);
    },

    async _completeDirectLogin(user: any, res: Response): Promise<any> {
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    lastLogin: new Date(),
                    'metadata.lastLoginAt': new Date()
                }
            }
        );

        const token = jwtUtils.generateToken({
            _id: user._id.toString(),
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            fullName: user.firstName + user.lastName,
            role: user.role,
            isAdmin: user.role === UserRole.ADMIN
        });

        jwtUtils.setAuthCookie(res, token);

        return {
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isAdmin: user.role === UserRole.ADMIN,
                    isEmailVerified: user.isEmailVerified,
                    isPhoneVerified: user.isPhoneVerified,
                    lastLogin: user.lastLogin
                },
                token
            }
        };
    },

    async _initiate2FA(user: any, res: Response): Promise<any> {
        const identifier = user.email || user.phone!;

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.deleteMany({
            identifier,
            purpose: OtpPurpose.LOGIN
        });

        await new OTP({
            identifier,
            otp: hashedOtp,
            purpose: OtpPurpose.LOGIN,
            expiresAt,
            isVerified: false,
            attempts: 0,
            tempUserData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password: ''
            }
        }).save();

        if (user.email) {
            await emailUtils.sendOTP(user.email.toLowerCase(), otp, "login");
        } else {
            console.log(`📱 2FA SMS OTP for ${user.phone}: ${otp}`);
        }

        return {
            success: true,
            message: "2FA verification required. Please check your email/phone for OTP.",
            data: {
                requires2FA: true,
                identifier,
                purpose: OtpPurpose.LOGIN,
                verificationType: user.email ? 'email' : 'phone'
            }
        };
    },

    async _prepareForgotPassword(otpRecord: any): Promise<any> {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 30 * 60 * 1000);

        const updateResult = await User.updateOne(
            { email: otpRecord.identifier.toLowerCase() },
            {
                $set: {
                    'metadata.passwordResetToken': resetToken,
                    'metadata.passwordResetExpiry': resetExpiry
                }
            }
        );
        console.log("Reset token update result:", updateResult);

        const user = await User.findByEmail(otpRecord.identifier.toLowerCase());
        console.log("User after reset token update:", user);

        if (!user || updateResult.modifiedCount === 0) {
            throw new AppError("Failed to prepare password reset", 500);
        }

        return {
            success: true,
            message: "OTP verified. You can now reset your password.",
            data: {
                resetToken,
                identifier: otpRecord.identifier
            }
        };
    },

    async _prepareChangePassword(otpRecord: any): Promise<any> {
        const changeToken = crypto.randomBytes(32).toString('hex');
        const changeExpiry = new Date(Date.now() + 30 * 60 * 1000);

        const updateResult = await User.updateOne(
            {
                $or: [
                    { email: otpRecord.identifier.toLowerCase() },
                    { phone: otpRecord.identifier }
                ]
            },
            {
                $set: {
                    'metadata.passwordChangeToken': changeToken,
                    'metadata.passwordChangeExpiry': changeExpiry
                }
            }
        );
        console.log("Change password token update result:", updateResult);

        return {
            success: true,
            message: "OTP verified. You can now change your password.",
            data: {
                changeToken,
                identifier: otpRecord.identifier
            }
        };
    },

    async _handleFailedLogin(user: any): Promise<void> {
        const failedAttempts = (user.metadata?.failedLoginAttempts || 0) + 1;
        const maxAttempts = 5;
        const lockDuration = 30 * 60 * 1000;

        const updateData: any = {
            'metadata.failedLoginAttempts': failedAttempts,
            'metadata.lastFailedLoginAt': new Date()
        };

        if (failedAttempts >= maxAttempts) {
            updateData['metadata.lockUntil'] = new Date(Date.now() + lockDuration);
        }

        await User.updateOne({ _id: user._id }, { $set: updateData });
    }
};
