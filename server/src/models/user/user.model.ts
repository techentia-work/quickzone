import { Schema, model, } from "mongoose";
import { IUserDocument, IUserModel, UserAccountStatus, UserRole } from "../../lib/types/index";
import { userModelUtils } from "./user.utils";

const UserSchema = new Schema<IUserDocument, IUserModel>(
    {
        firstName: { type: String, required: [true, 'First name is required'], trim: true, minlength: [2, 'First name must be at least 2 characters'], maxlength: [50, 'First name cannot exceed 50 characters'], match: [/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'] },
        lastName: { type: String, required: [true, 'Last name is required'], trim: true, minlength: [2, 'Last name must be at least 2 characters'], maxlength: [50, 'Last name cannot exceed 50 characters'], match: [/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'] },
        email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'], maxlength: [255, 'Email cannot exceed 255 characters'] },
        phone: { type: String, unique: true, sparse: true, trim: true, index: true, match: [/^\+\d{10,15}$/, 'Please enter a valid phone number'] },
        password: { type: String, required: [true, 'Password hash is required'], select: false },
        role: { type: String, enum: { values: Object.values(UserRole), message: 'Invalid user role' }, default: UserRole.USER, index: true },
        status: { type: String, enum: { values: Object.values(UserAccountStatus), message: 'Invalid account status' }, default: UserAccountStatus.PENDING_VERIFICATION, index: true },
        isAdmin: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true, index: true },
        isDeleted: { type: Boolean, default: false, index: true },
        fcmTokens: [
  {
    token: { type: String },
    createdAt: { type: Date, default: Date.now },
  }
],
        isEmailVerified: { type: Boolean, default: false, index: true },
        isPhoneVerified: { type: Boolean, default: false, index: true },
        lastLogin: { type: Date },
        deletedAt: { type: Date, default: null },
        metadata: { type: Schema.Types.Mixed, default: {} }
    },
    { timestamps: true, toJSON: { virtuals: true, transform: function (doc, r) { delete (r as any).password; return r; } }, toObject: { virtuals: true } }
);

UserSchema.index({ email: 1, phone: 1 }, { sparse: true });
UserSchema.index({ email: 1, isDeleted: 1 }, { sparse: true });
UserSchema.index({ phone: 1, isDeleted: 1 }, { sparse: true });
UserSchema.index({ isDeleted: 1, isActive: 1 });
UserSchema.index({ status: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLogin: -1 });

UserSchema.methods = userModelUtils.methods;
UserSchema.statics = userModelUtils.statics;
userModelUtils.virtuals(UserSchema);
userModelUtils.hooks(UserSchema);

export const User = model<IUserDocument, IUserModel>("User", UserSchema);
