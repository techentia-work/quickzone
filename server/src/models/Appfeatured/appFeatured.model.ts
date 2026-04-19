import mongoose, { Schema } from "mongoose";
import {
  AppTypeOfFeatured,
  AppFeaturedModelType,
  IAppFeaturedDocument,
  AppMappingItem,
} from "../../lib/types/AppFeatured/appFeatured.types";
import { createAppFeaturedPreSave } from "./appFeatured.utils";

const AppMappingSchema = new Schema<AppMappingItem>(
  {
    type: {
      type: String,
      enum: ["CATEGORY", "SUBCATEGORY", "PRODUCT", "URL"],
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
      refPath: "mappings.type",
      default: null,
    },
    imageUrl: { type: String, default: null },   // ✅ per-slot image
    externalUrl: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const AppFeaturedSchema = new Schema<IAppFeaturedDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },

    description: { type: String },
    imageUrl: { type: String },

    order: { type: Number, default: 0 },
    gridCount: { type: Number, default: 6 },      // ✅ 5 or 6 items per row
    position: {
      type: String,
      enum: [
        "TOP", "MIDDLE", "BOTTOM",
        "APP", "APP1", "APP2", "APP3",
        "APP4", "APP5", "APP6", "APP7", "APP8",
      ],
      required: true,
    },

    color: { type: String, default: "#ffffff" },

    type: {
      type: String,
      enum: Object.values(AppTypeOfFeatured),
      required: true,
    },

    mappings: { type: [AppMappingSchema], default: [] },

    masterCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    superCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
    ],

    subcategory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
    ],

    isClickable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    mapType: {
      type: String,
      enum: ["SUBCATEGORY", "PRODUCT", "NONE"],
      default: "NONE",
    },

    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// ✅ APP UNIQUE INDEX
AppFeaturedSchema.index({ slug: 1 });

// ✅ APP PRE-SAVE
AppFeaturedSchema.pre("save", createAppFeaturedPreSave);

// ✅ APP FEATURED MODEL (COLLECTION: appfeatured)
const AppFeatured =
  (mongoose.models.AppFeatured as AppFeaturedModelType) ||
  mongoose.model<IAppFeaturedDocument, AppFeaturedModelType>(
    "AppFeatured",
    AppFeaturedSchema,
    "appfeatured"
  );

export default AppFeatured;
