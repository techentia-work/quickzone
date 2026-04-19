/* ================= CREATE ================= */
export interface CreateBrandOfTheDayPayload {
  name: string;  
  title: string;
  websiteUrl: string;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: string | null;
  isActive?: boolean;
}

/* ================= UPDATE ================= */
export interface UpdateBrandOfTheDayPayload
  extends Partial<CreateBrandOfTheDayPayload> {}

/* ================= RESPONSE TYPE ================= */
export interface BrandOfTheDayType {
  _id: string;
    name: string;
  title: string;
  websiteUrl: string;
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

/* ================= FORM ERRORS ================= */
export type BrandOfTheDayFormErrors = Partial<
  Record<keyof CreateBrandOfTheDayPayload, string>
>;
