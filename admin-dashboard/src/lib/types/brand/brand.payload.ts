export interface CreateBrandPayload {
  name: string;
  slug?: string | null;
  banner?: string | null;
  thumbnail?: string | null;
  isActive?: boolean;
}

export interface UpdateBrandPayload extends Partial<CreateBrandPayload> {}

export interface BrandFormErrors {
  name?: string;
  slug?: string;
  banner?: string;
  thumbnail?: string;
  isActive?: string;
}