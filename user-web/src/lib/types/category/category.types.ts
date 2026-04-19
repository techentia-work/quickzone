import { TypeOfCategory } from "./category.enums";

export interface CategoryBasic {
    _id: string;
    name: string;
    slug?: string;
    type: TypeOfCategory;
    level?: number;
    fullSlug?: string;
}

export interface CategoryBase {
  name: string;
  slug: string;
  subtitle?: string;
  thumbnail?: string;
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;
  markup?: string;
  type: TypeOfCategory;
  parent?: string | null;          // ID reference
  ancestors?: string[];            // list of ancestor IDs
  path?: string[];
  fullSlug?: string;
  level?: number;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface CategoryType extends Omit<CategoryBase, "parent" | "ancestors"> {
    _id: string;
    parent?: CategoryBasic | null;
    ancestors: CategoryBasic[] | null;
    children?: CategoryType[];
    createdAt: string;
    updatedAt: string;
  __v?: number;
}