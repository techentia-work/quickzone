export interface CreateShopByStorePayload {
  name: string;
  slug?: string | null;
  banner?: string | null;
  thumbnail?: string | null;
  masterCategory?: string | null;
  isActive?: boolean;
}

export interface UpdateShopByStorePayload
  extends Partial<CreateShopByStorePayload> {}

export interface ShopByStoreType {
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

export type ShopByStoreFormErrors = Partial<
  Record<keyof CreateShopByStorePayload, string>
>;
