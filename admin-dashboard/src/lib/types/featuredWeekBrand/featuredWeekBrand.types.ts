// lib/types/featuredWeekBrand.types.ts

export interface CreateFeaturedWeekBrandPayload {
  name: string;
  slug?: string | null;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: string | null;
  isActive?: boolean;
}

export interface UpdateFeaturedWeekBrandPayload
  extends Partial<CreateFeaturedWeekBrandPayload> {}

export interface FeaturedWeekBrandType {
  _id: string;
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FeaturedWeekBrandFormErrors = Partial<
  Record<keyof CreateFeaturedWeekBrandPayload, string>
>;
