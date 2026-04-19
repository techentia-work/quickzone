// @/lib/middleware/withAuth.ts
import { Response, NextFunction, RequestHandler } from "express";
import { AppError, AuthRequest, UserRole } from "../../types/index";
import { jwtUtils } from "../../utils/token/token.utils";

export const withAuth = (
  requireAdmin = false,
  requireRole?: UserRole
): RequestHandler => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await jwtUtils.verifyRequestToken(req);

      if (!user) throw new AppError("Unauthorized", 401);

      req.user = {
        ...user,
        _id: user._id,
        role: user.role || (user.isAdmin ? "ADMIN" : "USER"),
      };

      if (requireRole && req.user.role !== requireRole) {
        throw new AppError(`Forbidden: Only ${requireRole}s allowed`, 403);
      }

      // console.log("User...." , user);
      
      if (requireAdmin && !user.isAdmin) {
        throw new AppError("Forbidden: Admin only access", 403);
      }

      // console.log("1111");
      
      next();
    } catch (err) {
      // console.log("Auth error:", err);
      next(err);
    }
  };
};
