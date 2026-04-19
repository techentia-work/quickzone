"use client";

import { useCategoryDisplay } from "@/hooks";
import { useCart } from "@/hooks/entities/useCart";
import { useAuth } from "@/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/store";
import { useProductsByCategoryTree } from "@/hooks";

const MasterCategoriesHome = () => {
  const { selectedMasterCategoryId } = useAppSelector(
    (state) => state.category
  );

  const { data: categories, isLoading } = useCategoryDisplay(selectedMasterCategoryId ?? "");

  if (isLoading) {
    return (
      <section className="py-6 bg-white">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="text-center py-8 text-gray-500">
            Loading categories...
          </div>
        </div>
      </section>
    );
  }

  if (!categories?.length) {
    return (
      <section className="py-6 bg-white">
        <div className="mx-auto px-4 max-w-7xl"></div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-white">
      <div className="mx-auto px-4 max-w-7xl">
        {categories.map((category: any) => (
          <CategorySection key={category._id} category={category} />
        ))}
      </div>
    </section>
  );
};

interface CategorySectionProps {
  category: {
    _id: string;
    name: string;
    slug: string;
    thumbnail?: string;
    subtitle?: string;
  };
}

const CategorySection = ({ category }: CategorySectionProps) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Single API call - gets all products from category + subcategories
  const { data, isLoading } = useProductsByCategoryTree(category._id, {
    limit: 8,
  });

  const handleAddToCart = async (p: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      return;
    }

    if (!p?._id) return;
    setAddingProductId(p._id);

    try {
      await addItem({
        productId: p._id,
        variantId: p.variants?.[0]?._id ?? null,
        quantity: 1,
      });

      toast.success(`${p.name} added to cart!`);
    } catch (err: any) {
      toast.error("Failed to add product to cart");
      console.error(err);
    } finally {
      setAddingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {category.thumbnail && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={category.thumbnail}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">Loading products...</div>
      </div>
    );
  }

  // Don't render if no products
  if (!data?.products?.length) {
    return null;
  }

  const allProducts = data.products;

  return (
    <div className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {category.thumbnail && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white">
              <Image
                src={category.thumbnail}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
            {category.subtitle && (
              <p className="text-sm text-gray-600">{category.subtitle}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(`/categories/${category.slug}`)}
          className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
        >
          View All
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Products Grid - 8 per row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {allProducts.map((p: any) => {
          const defaultVariant = p.variants?.[0];
          const imageUrl =
            defaultVariant?.images?.[0] ||
            p.mainImage ||
            p.thumbnail ||
            (Array.isArray(p.images) ? p.images[0] : null) ||
            "/placeholder.png";

          const link = `/product/${p.slug}`;

          const isOutOfStock =
            defaultVariant?.inventoryType === "LIMITED" &&
            defaultVariant?.stock === 0;

          return (
            <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition flex flex-col"
            >
              {/* Product Image */}
              <div
                onClick={() => router.push(link)}
                className="relative w-full h-24 mb-2 cursor-pointer"
              >
                <Image
                  src={imageUrl}
                  alt={p.name || "Product"}
                  fill
                  unoptimized
                  className="object-contain rounded-lg"
                />
                {(defaultVariant?.discountPercent ?? 0) > 0 && (
                  <span className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {defaultVariant.discountPercent}% OFF
                  </span>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                    <span className="bg-white text-gray-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Title */}
              <h3
                onClick={() => router.push(link)}
                className="text-xs font-medium text-gray-800 line-clamp-2 text-center cursor-pointer hover:text-green-600 mb-1"
              >
                {p.name}
              </h3>

              {/* Unit/Variant Info */}
              {Boolean(defaultVariant?.measurement) && defaultVariant?.measurementUnit && (
                <p className="text-[10px] text-gray-500 text-center mb-1">
                  {defaultVariant.measurement} {defaultVariant.measurementUnit}
                </p>
              )}

              {/* Product Price */}
              <div className="text-center mt-auto mb-2">
                {defaultVariant?.discountedPrice ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] font-semibold text-green-600">
                        ₹{defaultVariant.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-400 line-through">
                        ₹{defaultVariant.mrp || defaultVariant.price}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[13px] font-semibold text-gray-800">
                    ₹{defaultVariant?.price?.toFixed(2) ?? p.price}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={addingProductId === p._id || isOutOfStock || !p.isActive}
                  className={`text-[12px] font-medium flex items-center gap-1 justify-center w-full py-1.5 rounded-lg transition ${addingProductId === p._id || isOutOfStock || !p.isActive
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                  {addingProductId === p._id ? (
                    "Adding..."
                  ) : isOutOfStock ? (
                    "Out of Stock"
                  ) : !p.isActive ? (
                    "Unavailable"
                  ) : (
                    <>
                      <ShoppingCart size={14} /> Add
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasterCategoriesHome;