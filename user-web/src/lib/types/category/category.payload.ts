import { CategoryBase } from "./category.types";
import { TypeOfCategory } from "./category.enums";

export type CreateCategoryPayload = Omit<
  CategoryBase,
  "ancestors" | "path" | "fullSlug" | "level" | "isDeleted" | "deletedAt"
> & {
  parent?: string | null;
  type: TypeOfCategory;
  isActive?: boolean;
  order?: number;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface BulkDeleteCategoriesPayload {
  categoryIds: string[];
}

export interface BulkUpdateCategoriesPayload {
  categoryIds: string[];
  updateData: {
    isActive?: boolean;
    order?: number;
    parent?: string | null;
  };
}

export interface CategoryTreeQueryParams {
  type?: TypeOfCategory;
  includeDeleted?: boolean;
  maxDepth?: number;
}
