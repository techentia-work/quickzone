import { Router } from "express";
import { validate, withAuth } from "../../lib/middlewares/index";
import { productSchema } from "../../lib/schema/index";
import { Product, Category } from "../../models/index";
import mongoose from "mongoose";
import { productController } from "../../controllers/product/product.controller";

export const productRouter = Router();

productRouter.post("/", withAuth(true), validate(productSchema.createProductSchema), productController.createProduct);
productRouter.get("/", productController.getProducts);
productRouter.get("/category-tree/:categoryId", productController.getProductsByCategoryTree);
productRouter.get("/:id", productController.getProductById);
productRouter.get("/slug/:id", productController.getProductBySlug);
productRouter.put("/:id", withAuth(true), validate(productSchema.updateProductSchema), productController.updateProduct);
productRouter.delete("/:id", withAuth(true), productController.deleteProduct);
productRouter.patch("/bulk-update", withAuth(true), validate(productSchema.bulkUpdateProductsSchema), productController.bulkUpdateProducts);
productRouter.get("/category/:categoryId", productController.getProductsByCategory);
productRouter.get("/brand/:brandId", productController.getProductsByBrand);
productRouter.get("/seller/:sellerId", productController.getProductsBySeller);
productRouter.patch("/:productId/toggle-status", withAuth(true), productController.toggleProductStatus);
productRouter.put("/:productId/variants/:variantId", withAuth(true), validate(productSchema.updateVariantSchema), productController.updateProductVariant);
productRouter.delete("/:productId/variants/:variantId", withAuth(true), productController.deleteProductVariant);
productRouter.get("/analytics/stats", withAuth(true), productController.getProductStats);

productRouter.post("/bulk", withAuth(true), async (req, res) => {
    const products = req.body; // array of product objects
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error("No products provided");
    }

    const createdProducts: any[] = [];
    const session = await mongoose.startSession();
    const startTime = new Date();

    try {
        await session.withTransaction(async () => {
            for (const prod of products) {
                // Resolve placeholder categoryId
                if (typeof prod.categoryId === "string" && prod.categoryId.startsWith("{{") && prod.categoryId.endsWith("_id}}")) {
                    const key = prod.categoryId.slice(2, -5); // "{{slug_id}}" -> "slug"
                    // Find the category by slug
                    const category = await Category.findOne({ slug: key }).session(session);
                    if (!category) throw new Error(`Category not found for placeholder: ${key}`);
                    prod.categoryId = category._id;
                }

                // Validate category exists
                const category = await Category.findById(prod.categoryId).session(session);
                if (!category) throw new Error(`Category not found for product: ${prod.name}`);

                // Handle variants if missing
                if (!prod.variants || !Array.isArray(prod.variants) || prod.variants.length === 0) {
                    prod.variants = [{
                        sku: `${prod.slug}-default`,
                        variantType: "packet",
                        price: prod.price || 0,
                        stock: 100,
                        inventoryType: "LIMITED",
                        status: "AVAILABLE"
                    }];
                }

                // Set category path dynamically
                const product = new Product({
                    ...prod,
                    categoryPath: category.ancestors ? [...category.ancestors, category._id] : [category._id],
                });

                await product.save({ session });
                createdProducts.push(product);
            }
        });

        const endTime = new Date();

        return res.status(201).json({
            message: "Products created successfully",
            products: createdProducts,
        });
    } finally {
        session.endSession();
    }
}
);
