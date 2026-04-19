import bcrypt from "bcryptjs";
import crypto from "crypto";
import { IUserDocument, IUserModel, UserAccountStatus, UserRole } from "../../lib/types/index";
import { Schema } from "mongoose";

export const userModelUtils = {
    // 🔹 Instance methods
    methods: {
        async comparePassword(this: IUserDocument, password: string): Promise<boolean> {
            console.log(password)
            return bcrypt.compare(password, this.password);
        },

        generatePasswordResetToken(this: IUserDocument): string {
            return crypto.randomBytes(32).toString("hex");
        },

        async softDelete(this: IUserDocument): Promise<void> {
            await this.updateOne({
                $set: { isDeleted: true, deletedAt: new Date(), isActive: false, status: UserAccountStatus.INACTIVE }
            });
        }
    },

    // 🔹 Static methods
    statics: {
        findByEmail(this: IUserModel, email: string) {
            return this.findOne({ email: email.toLowerCase(), isDeleted: false });
        },
        findByPhone(this: IUserModel, phone: string) {
            return this.findOne({ phone: phone.trim(), isDeleted: false });
        }
    },

    // 🔹 Virtuals
    virtuals(schema: Schema<IUserDocument, IUserModel>) {
        schema.virtual("fullName").get(function (this: IUserDocument) {
            return `${this.firstName} ${this.lastName}`.trim();
        });

        schema.virtual("isLocked").get(function (this: IUserDocument) {
            return !!(this.metadata?.lockUntil && this.metadata.lockUntil > new Date());
        });
    },

    // 🔹 Hooks
    hooks(schema: Schema<IUserDocument, IUserModel>) {
        schema.pre("validate", function (this: IUserDocument) {
            if (!this.email && !this.phone) {
                new Error("Either email or phone must be provided");
            }
        });
    }
};
