// @/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../../controllers/index';
import { withAuth, validate } from '../../lib/middlewares/index';
import { authSchema } from '../../lib/schema/index';

export const authRouter = Router();

// Public routes
authRouter.post('/register', validate(authSchema.registerSchema), authController.register);
authRouter.post('/verify-otp', validate(authSchema.verifyOTPSchema), authController.verifyOTP);
authRouter.post('/resend-otp', validate(authSchema.resendOTPSchema), authController.resendOTP);
authRouter.post('/login', validate(authSchema.loginSchema), authController.login);
authRouter.post('/forgot-password', validate(authSchema.forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(authSchema.resetPasswordSchema), authController.resetPassword);
authRouter.post('/change-password/complete', validate(authSchema.completeChangePasswordSchema), authController.completeChangePassword);
authRouter.get("/me", withAuth(false), authController.me)
authRouter.post('/phone', authController.phoneLoginOrRegister);

// Protected routes
authRouter.post('/change-password/initiate', withAuth(), validate(authSchema.initiateChangePasswordSchema), authController.initiateChangePassword);
authRouter.post('/logout', withAuth(), authController.logout);
