import { Document, Model, Types } from "mongoose";

export interface IBrandOfTheDay {
  name: string;                       // internal / short name
  title: string;         
websiteUrl: string;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandOfTheDayDocument
  extends IBrandOfTheDay,
    Document {}

export interface BrandOfTheDayModelType
  extends Model<IBrandOfTheDayDocument> {}
