// ---------- CREATE SLIDER PAYLOAD ----------
export interface CreateSliderPayload {
  title: string;
  slug: string;
  imageUrl: string; 
  description?: string;
  order?: number;
  position: "TOP" | "MIDDLE" | "BOTTOM" | "APP"; // ✅ add position field
  link?: string;
  isActive: boolean;
  autoPlay?: boolean;
  masterCategory?: string | null;
}

// ---------- UPDATE SLIDER PAYLOAD ----------
export interface UpdateSliderPayload extends Partial<CreateSliderPayload> {
  _id?: string;
}

// ---------- SLIDER FORM ERRORS ----------
export interface SliderFormErrors {
  title?: string;
  slug?: string;
  description?: string;
  images?: string;
  order?: string;
  link?: string;
  isActive?: string;
  autoPlay?: string;
  transitionSpeed?: string;
  [key: string]: string | undefined;
}

// ---------- SLIDER TYPE ----------
export interface SliderType extends CreateSliderPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}