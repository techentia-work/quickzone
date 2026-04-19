import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { categoryController } from "../../controllers/index";
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema } from "../../lib/schema/index";
import mongoose from "mongoose";
import { Category } from "../../models/index";

export const categoryRouter = Router();

categoryRouter.post("/", withAuth(true), validate(createCategorySchema), categoryController.createCategory);
categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/admin/categories", withAuth(true), categoryController.getCategoriesForAdmin);
categoryRouter.get("/tree", categoryController.getCategoryTree);
categoryRouter.get("/display", categoryController.getCategoriesForDisplay);
categoryRouter.get("/:id", categoryController.getCategoryById);
categoryRouter.get("/slug/:slug", categoryController.getCategoryBySlug);
categoryRouter.put("/:id", withAuth(true), validate(updateCategorySchema), categoryController.updateCategory);
categoryRouter.delete("/bulk", withAuth(true), categoryController.deleteCategoryBulk);
categoryRouter.delete("/:id", withAuth(true), categoryController.deleteCategory);
categoryRouter.patch("/:id/restore", withAuth(true), categoryController.restoreCategory);
categoryRouter.post("/:id/rebuild-tree", withAuth(true), categoryController.rebuildTree);
categoryRouter.post("/rebuild-tree/all", withAuth(true), categoryController.rebuildTree)

categoryRouter.post("/bulk-add", withAuth(true), async (req, res) => {
    const categories = req.body; // array of categories with placeholders
    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ message: "No categories provided" });
    }

    const createdCategories: any[] = [];
    const idMap: Record<string, any> = {}; // slug -> _id mapping

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // Iterate through categories in order
            for (const cat of categories) {
                // If parent is a placeholder like "{{groceries_id}}", replace it with real _id
                if (typeof cat.parent === "string" && cat.parent.startsWith("{{") && cat.parent.endsWith("_id}}")) {
                    const key = cat.parent.slice(2, -5); // removes "{{" and "_id}}"
                    if (!idMap[key]) {
                        throw new Error(`Parent category "${key}" has not been created yet`);
                    }
                    cat.parent = idMap[key];
                }

                const category = new Category(cat);
                await category.save({ session });

                createdCategories.push(category);
                // Store _id in idMap for future children references
                idMap[cat.slug] = category._id;
            }
        });

        return res.status(201).json({ message: "Categories created successfully", categories: createdCategories, });
    } finally {
        session.endSession();
    }
});

[
    { "name": "Groceries", "slug": "groceries", "type": "MASTER" },
    { "name": "Electronics", "slug": "electronics", "type": "MASTER" },
    { "name": "Fashion", "slug": "fashion", "type": "MASTER" },

    { "name": "Grocery & Kitchen", "slug": "grocery-kitchen", "type": "SUPER", "parent": "{{groceries_id}}" },
    { "name": "Snacks & Drinks", "slug": "snacks-drinks", "type": "SUPER", "parent": "{{groceries_id}}" },

    { "name": "Fruits", "slug": "fruits", "type": "CATEGORY", "parent": "{{grocery-kitchen_id}}" },
    { "name": "Vegetables", "slug": "vegetables", "type": "CATEGORY", "parent": "{{grocery-kitchen_id}}" },
    { "name": "Chips", "slug": "chips", "type": "CATEGORY", "parent": "{{snacks-drinks_id}}" },
    { "name": "Beverages", "slug": "beverages", "type": "CATEGORY", "parent": "{{snacks-drinks_id}}" },

    { "name": "Apples", "slug": "apples", "type": "SUBCATEGORY", "parent": "{{fruits_id}}" },
    { "name": "Bananas", "slug": "bananas", "type": "SUBCATEGORY", "parent": "{{fruits_id}}" },
    { "name": "Tomatoes", "slug": "tomatoes", "type": "SUBCATEGORY", "parent": "{{vegetables_id}}" },
    { "name": "Potatoes", "slug": "potatoes", "type": "SUBCATEGORY", "parent": "{{vegetables_id}}" },
    { "name": "Potato Chips", "slug": "potato-chips", "type": "SUBCATEGORY", "parent": "{{chips_id}}" },
    { "name": "Corn Chips", "slug": "corn-chips", "type": "SUBCATEGORY", "parent": "{{chips_id}}" },
    { "name": "Soda", "slug": "soda", "type": "SUBCATEGORY", "parent": "{{beverages_id}}" },
    { "name": "Juice", "slug": "juice", "type": "SUBCATEGORY", "parent": "{{beverages_id}}" },

    { "name": "Computers", "slug": "computers", "type": "SUPER", "parent": "{{electronics_id}}" },
    { "name": "Phones", "slug": "phones", "type": "SUPER", "parent": "{{electronics_id}}" },

    { "name": "Laptops", "slug": "laptops", "type": "CATEGORY", "parent": "{{computers_id}}" },
    { "name": "Desktops", "slug": "desktops", "type": "CATEGORY", "parent": "{{computers_id}}" },
    { "name": "Smartphones", "slug": "smartphones", "type": "CATEGORY", "parent": "{{phones_id}}" },
    { "name": "Accessories", "slug": "accessories", "type": "CATEGORY", "parent": "{{phones_id}}" },

    { "name": "Gaming Laptops", "slug": "gaming-laptops", "type": "SUBCATEGORY", "parent": "{{laptops_id}}" },
    { "name": "Ultrabooks", "slug": "ultrabooks", "type": "SUBCATEGORY", "parent": "{{laptops_id}}" },
    { "name": "Gaming Desktops", "slug": "gaming-desktops", "type": "SUBCATEGORY", "parent": "{{desktops_id}}" },
    { "name": "Workstations", "slug": "workstations", "type": "SUBCATEGORY", "parent": "{{desktops_id}}" },
    { "name": "Android Phones", "slug": "android-phones", "type": "SUBCATEGORY", "parent": "{{smartphones_id}}" },
    { "name": "iPhones", "slug": "iphones", "type": "SUBCATEGORY", "parent": "{{smartphones_id}}" },
    { "name": "Chargers", "slug": "chargers", "type": "SUBCATEGORY", "parent": "{{accessories_id}}" },
    { "name": "Cases", "slug": "cases", "type": "SUBCATEGORY", "parent": "{{accessories_id}}" },

    { "name": "Men", "slug": "men", "type": "SUPER", "parent": "{{fashion_id}}" },
    { "name": "Women", "slug": "women", "type": "SUPER", "parent": "{{fashion_id}}" },

    { "name": "Shirts", "slug": "shirts", "type": "CATEGORY", "parent": "{{men_id}}" },
    { "name": "Pants", "slug": "pants", "type": "CATEGORY", "parent": "{{men_id}}" },
    { "name": "Dresses", "slug": "dresses", "type": "CATEGORY", "parent": "{{women_id}}" },
    { "name": "Accessories", "slug": "accessories-women", "type": "CATEGORY", "parent": "{{women_id}}" },

    { "name": "Casual Shirts", "slug": "casual-shirts", "type": "SUBCATEGORY", "parent": "{{shirts_id}}" },
    { "name": "Formal Shirts", "slug": "formal-shirts", "type": "SUBCATEGORY", "parent": "{{shirts_id}}" },
    { "name": "Jeans", "slug": "jeans", "type": "SUBCATEGORY", "parent": "{{pants_id}}" },
    { "name": "Chinos", "slug": "chinos", "type": "SUBCATEGORY", "parent": "{{pants_id}}" },
    { "name": "Evening Dresses", "slug": "evening-dresses", "type": "SUBCATEGORY", "parent": "{{dresses_id}}" },
    { "name": "Casual Dresses", "slug": "casual-dresses", "type": "SUBCATEGORY", "parent": "{{dresses_id}}" },
    { "name": "Handbags", "slug": "handbags", "type": "SUBCATEGORY", "parent": "{{accessories-women_id}}" },
    { "name": "Jewelry", "slug": "jewelry", "type": "SUBCATEGORY", "parent": "{{accessories-women_id}}" }
]
