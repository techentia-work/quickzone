import { Request } from "express"
import { AuthenticatedUser } from "../user/user.types";

export interface AuthRequest extends Request {
    user?: AuthenticatedUser;
}
