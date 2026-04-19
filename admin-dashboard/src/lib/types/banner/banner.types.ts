// ---------- CREATE BANNER PAYLOAD ----------
export interface CreateBannerPayload {
  title: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  position: "TOP" | "MIDDLE" | "BOTTOM" | "APP"; // ✅ add position field
  masterCategory?: string | null; // ✅ Allow null for general banners
  isActive: boolean;
  slug?: string; // optional clickable link
}

// ---------- UPDATE BANNER PAYLOAD ----------
export interface UpdateBannerPayload extends Partial<CreateBannerPayload> {
  _id?: string;
}

// ---------- BANNER FORM ERRORS ----------
export interface BannerFormErrors {
  title?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: string;
  isActive?: string;
  [key: string]: string | undefined;
}

// ---------- BANNER TYPE (Returned from backend) ----------
export interface BannerType {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
  position?: "TOP" | "MIDDLE" | "BOTTOM" | "APP"; // ✅ add this for clarity
  isActive: boolean;
  masterCategory?: {
    _id: string;
    name?: string;
  } | null; // ✅ backend usually populates this
  createdAt: string;
  updatedAt: string;
}
