/* ---------- FEATURED TYPE ENUM ---------- */
export enum FeaturedTypeEnum {
  BANNER = "BANNER",
  SLIDER = "SLIDER",
  FEATURED = "FEATURED",
}

export enum AppLayout {
  DEFAULT = "DEFAULT",
  HERO = "HERO",
}

/* ---------- MAPPING TYPE ---------- */
export interface FeaturedMapping {
  type: "CATEGORY" | "SUBCATEGORY" | "PRODUCT" | "URL";
  refId?: string;
  externalUrl?: string;
}

/* ---------- CREATE FEATURED PAYLOAD ---------- */
export interface CreateFeaturedPayload {
  title: string;
  slug: string;

  description?: string;
  color?: string;

  imageUrl?: string;   // primary image
  imageUrl1?: string;  // ✅ secondary / mobile image
  
  appLayout?: "DEFAULT" | "HERO";
  gridCount?: number;

  link?: string;

  order?: number;
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

  metaTitle?: string;
  metaDescription?: string;

  isActive: boolean;
  isMappable: boolean;
  isClickable: boolean;

  /* ---------- CATEGORY SUPPORT ---------- */
  masterCategory?: string | null;
  category?: string[];
  subcategory?: string[];

  mapType?: "CATEGORY" | "SUBCATEGORY" | "PRODUCT" | "NONE";

  mappings?: FeaturedMapping[];
}

/* ---------- UPDATE FEATURED PAYLOAD ---------- */
export interface UpdateFeaturedPayload
  extends Partial<CreateFeaturedPayload> {
  _id?: string;
}

/* ---------- FEATURED FORM ERRORS ---------- */
export interface FeaturedFormErrors {
  title?: string;
  slug?: string;
  description?: string;

  imageUrl?: string;
  imageUrl1?: string; // ✅ ADD

  type?: string;
  link?: string;
  order?: string;
  appLayout?: string;
  gridCount?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: string;
  category?: string;
  subcategory?: string;

  [key: string]: string | undefined;
}

/* ---------- FEATURED RESPONSE TYPE ---------- */
export interface FeaturedType extends CreateFeaturedPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
