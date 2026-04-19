import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/index";
import { ZodSchema } from "zod";

export const validate =
    (schema: ZodSchema) =>
        (req: AuthRequest, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                return next(result.error);
            }

            req.body = result.data
            next();
        };
