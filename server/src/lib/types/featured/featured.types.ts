import mongoose, { Document, Model, Schema } from "mongoose";

export enum TypeOfFeatured {
  BANNER = "BANNER",
  SLIDER = "SLIDER",
  FEATURED = "FEATURED",
}

export interface MappingItem {
  type: "CATEGORY" | "SUBCATEGORY" | "PRODUCT" | "URL";
  refId?: Schema.Types.ObjectId | null;
  externalUrl?: string | null;
}

export enum AppLayout {
  DEFAULT = "DEFAULT",
  HERO = "HERO",
}

export interface IFeaturedDocument extends Document {
  title: string;
  slug: string;
  description?: string;

  imageUrl?: string;      // primary image
  imageUrl1?: string;     // ✅ secondary image (NEW)

  order: number;
  position:
    | "TOP"
    | "MIDDLE"
    | "BOTTOM"
    | "APP"
    | "APP1"
    | "APP2"
    | "APP3"
    | "APP4"
    | "APP5"
    | "APP6"
    | "APP7"
    | "APP8";

  color: string;
  appLayout: AppLayout;
  gridCount: number;
  type: TypeOfFeatured;

  mappings: MappingItem[];

  masterCategory?: Schema.Types.ObjectId | null;
  superCategory?: Schema.Types.ObjectId | null;
  category?: Schema.Types.ObjectId[] | null;
  subcategory?: Schema.Types.ObjectId[] | null;

  isClickable: boolean;
  isActive: boolean;
  isDeleted: boolean;
  mapType: "SUBCATEGORY" | "PRODUCT" | "NONE";

  metaTitle?: string;
  metaDescription?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface FeaturedModelType extends Model<IFeaturedDocument> {}

const MappingSchema = new Schema<MappingItem>(
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
    externalUrl: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const FeaturedSchema = new Schema<IFeaturedDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },

    imageUrl: { type: String },
    imageUrl1: { type: String }, // ✅ NEW OPTIONAL IMAGE

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
      required: true,
    },
    color: { type: String, default: "#ffffff" },
    appLayout: {
      type: String,
      enum: Object.values(AppLayout),
      default: AppLayout.DEFAULT,
    },
    gridCount: {
      type: Number,
      enum: [5, 6],
      default: 6,
    },
    type: {
      type: String,
      enum: Object.values(TypeOfFeatured),
      required: true,
    },

    mappings: { type: [MappingSchema], default: [] },

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
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

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

FeaturedSchema.index({ slug: 1 });

const Featured =
  (mongoose.models.Featured as FeaturedModelType) ||
  mongoose.model<IFeaturedDocument, FeaturedModelType>(
    "Featured",
    FeaturedSchema
  );

export default Featured;
