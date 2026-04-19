import { FeaturedSection, Product, Category, Brand } from "../../models/index";
import AppFeatured from "../../models/Appfeatured/appFeatured.model";
import { createFeaturedController } from "./base.controller";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";

const baseController = createFeaturedController(
  FeaturedSection,
  "Featured Section"
);

export const featuredSectionController = {
  ...baseController,

  // ---------- OVERRIDE GET ALL ----------
  async getAll(req: any, res: any, next: any) {
    try {
      const { position } = req.query;

      // 1. Build common query
      const { filter, pagination, sort } = helperServerUtils.buildQuery(
        req.query,
        ["isActive", "order", "type", "mapType", "position", "masterCategory"],
        "createdAt",
        ["title", "slug", "metaTitle", "metaDescription"]
      );

      const query = {
        ...filter,
        isDeleted: false,
        position: position || { $in: ["TOP", "BOTTOM", "MIDDLE", "APP", "APP1", "APP2", "APP3", "APP4", "APP5", "APP6", "APP7", "APP8"] },
      };

      // 2. Fetch from both models in parallel
      const [sections, appSections, sectionTotal, appTotal] = await Promise.all([
        FeaturedSection.find(query).lean(),
        AppFeatured.find(query).lean(),
        FeaturedSection.countDocuments({ ...filter, isDeleted: false }),
        AppFeatured.countDocuments({ ...filter, isDeleted: false }),
      ]);

      // 3. Combine and apply manual pagination/sorting if needed OR just combine and sort
      // (Usually these lists are small enough to combine and sort in memory)
      let combined = [...sections, ...appSections];
      
      // Sort by order 1 (ascending)
      combined.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      // 4. Populate combined list (copying logic from base.controller)
      const populatedList = await Promise.all(
        combined.map(async (item: any) => {
          // Re-populate basic refs (manual populate because we used .lean())
          if (item.masterCategory) {
             item.masterCategory = await Category.findById(item.masterCategory).select("name slug type").lean();
          }
          if (Array.isArray(item.category) && item.category.length > 0) {
             item.category = await Category.find({ _id: { $in: item.category } }).select("name slug type").lean();
          }
          if (Array.isArray(item.subcategory) && item.subcategory.length > 0) {
             item.subcategory = await Category.find({ _id: { $in: item.subcategory } }).select("name slug type").lean();
          }

          if (!Array.isArray(item.mappings)) return item;
          
          const mappings = await Promise.all(
            item.mappings.map(async (map: any) => {
              if (map.type === "PRODUCT" && map.refId) {
                const product = await Product.findById(map.refId)
                  .select("name slug mainImage price variants")
                  .lean();
                return { ...map, data: product };
              } else if (map.type === "SUBCATEGORY" && map.refId) {
                const sub = await Category.findById(map.refId)
                  .select("name slug thumbnail")
                  .lean();
                return { ...map, data: sub };
              } else if (map.type === "CATEGORY" && map.refId) {
                const cat = await Category.findById(map.refId)
                  .select("name slug thumbnail")
                  .lean();
                return { ...map, data: cat };
              } else if (map.type === "BRAND" && map.refId) {
                const brand = await Brand.findById(map.refId)
                  .select("name slug thumbnail banner")
                  .lean();
                return { ...map, data: brand };
              }
              return map;
            })
          );
          return { ...item, mappings };
        })
      );

      res.status(200).json({
        success: true,
        message: "Featured list fetched successfully (Aggregated)",
        data: {
          items: populatedList,
          pagination: {
            currentPage: pagination.page,
            totalPages: Math.ceil((sectionTotal + appTotal) / pagination.limit),
            totalCount: sectionTotal + appTotal,
            limit: pagination.limit,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
