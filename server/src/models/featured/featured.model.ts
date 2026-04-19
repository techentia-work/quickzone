import { model, Schema } from "mongoose";
import { createFeaturedPreSave } from "./featured.utils";
import { FeaturedModelType, IFeaturedDocument } from "../../lib/types/index";

const MappingSchema = new Schema(
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
    externalUrl: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const FeaturedSchema = new Schema<IFeaturedDocument, FeaturedModelType>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },

    imageUrl: { type: String, trim: true },
    imageUrl1: { type: String, trim: true }, // ✅ NEW OPTIONAL IMAGE

    color: {
      type: String,
      trim: true,
      default: "#ffffff",
      validate: {
        validator: (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v),
        message: (props: any) =>
          `${props.value} is not a valid hex color!`,
      },
    },

    order: { type: Number, default: 0 },
    position: {
      type: String,
      enum: [
        "TOP",
        "MIDDLE",
        "BOTTOM",
        "APP",
        "APP1",
        "APP2",
        "APP3",
        "APP4",
        "APP5",
        "APP6",
        "APP7",
        "APP8",
      ],
      default: "TOP",
    },

    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    isActive: { type: Boolean, default: true },
    isClickable: { type: Boolean, default: false },

    mapType: {
      type: String,
      enum: ["SUBCATEGORY", "PRODUCT", "NONE"],
      default: "NONE",
    },
    mappings: { type: [MappingSchema], default: [] },

    masterCategory: {
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

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FeaturedSchema.index({ slug: 1 }, { unique: true });

FeaturedSchema.pre("save", createFeaturedPreSave);

export const Banner = model("Banner", FeaturedSchema);
export const Slider = model("Slider", FeaturedSchema);
export const FeaturedSection = model("FeaturedSection", FeaturedSchema);
