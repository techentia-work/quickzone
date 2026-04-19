export interface BrandType {
  _id: string;
  name: string;
  slug: string;
  banner?: string | null;
  thumbnail?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}