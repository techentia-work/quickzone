import { HydratedDocument } from "mongoose";
import { IFeaturedDocument } from "../../lib/types/index";

export async function createFeaturedPreSave(this: HydratedDocument<IFeaturedDocument>, next: () => void): Promise<void> {
    if (!this.slug) {
      this.slug = this.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
}
