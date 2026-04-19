// @/lib/utils/server/jwt.server.utils.ts

import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { AppError, AuthenticatedUser } from "../../types/index";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const COOKIE_NAME =
    process.env.NEXT_PUBLIC_TOKEN_COOKIE_NAME || "auth_token";

const isProd = process.env.NODE_ENV === "production";

export const jwtUtils = {
    // =====================
    // TOKEN
    // =====================
    generateToken(payload: AuthenticatedUser): string {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        } as SignOptions);
    },

    verifyToken(token: string): AuthenticatedUser {
        try {
            return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                throw new AppError("Token expired", 401);
            }
            if (error.name === "JsonWebTokenError") {
                throw new AppError("Invalid token", 401);
            }
            throw new AppError("Token verification failed", 401);
        }
    },

    // =====================
    // COOKIE
    // =====================
    setAuthCookie(res: Response, token: string): void {
        // API is always HTTPS (api.quickzon.in), so always use Secure cookies
        const cookie = [
            `${COOKIE_NAME}=${token}`,
            "HttpOnly",
            "Path=/",
            `Max-Age=${7 * 24 * 60 * 60}`,
            "SameSite=None",
            "Secure",
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);
        console.log("🍪 Cookie set:", cookie);
    },

    clearAuthCookie(res: Response): void {
        const cookie = [
            `${COOKIE_NAME}=`,
            "HttpOnly",
            "Path=/",
            "Max-Age=0",
            "SameSite=None",
            "Secure",
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);
    },

    // =====================
    // REQUEST
    // =====================
    getTokenFromRequest(req: Request): string | null {
        // 1️⃣ Cookie se
        const cookieToken = req.cookies?.[COOKIE_NAME];
        if (cookieToken) return cookieToken;

        // 2️⃣ Authorization header se (fallback)
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    },

    async verifyRequestToken(req: Request): Promise<AuthenticatedUser> {
        const token = this.getTokenFromRequest(req);
        if (!token) {
            throw new AppError("No token provided", 401);
        }
        return this.verifyToken(token);
    },

    cookie: {
        getUser(req: Request): AuthenticatedUser | null {
            try {
                const token = jwtUtils.getTokenFromRequest(req);
                if (!token) return null;
                return jwtUtils.verifyToken(token);
            } catch {
                return null;
            }
        },
    },
};
