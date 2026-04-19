"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCategory, useProducts, useFilter, useUserProfile } from "@/hooks";
import { TypeOfCategory, CategoryType } from "@/lib/types";
import { ProductType } from "@/lib/types/product/product.types";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/entities/useCart";
import toast from "react-hot-toast";

// ========================
// 🧭 Category Sidebar
// ========================
interface CategorySidebarProps {
  category: CategoryType;
  subcategories: CategoryType[];
  selectedSubcategoryId: string | null;
  onSubcategorySelect: (id: string) => void;
}

function CategorySidebar({
  category,
  subcategories,
  selectedSubcategoryId,
  onSubcategorySelect,
}: CategorySidebarProps) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto sticky top-0 hidden md:block">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
        {category.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{category.subtitle}</p>
        )}
      </div>

      <nav className="p-3">
        {subcategories.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            No subcategories available
          </div>
        ) : (
          <ul className="space-y-1">
            {subcategories.map((subcategory) => (
              <li key={subcategory._id}>
                <button
                  onClick={() => onSubcategorySelect(subcategory._id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                    ${
                      selectedSubcategoryId === subcategory._id
                        ? "bg-green-50 border border-green-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  {subcategory.thumbnail && (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-gray-100">
                      <Image
                        src={subcategory.thumbnail}
                        alt={subcategory.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span
                    className={`flex-1 text-left text-sm font-medium line-clamp-2
                      ${
                        selectedSubcategoryId === subcategory._id
                          ? "text-green-700"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                  >
                    {subcategory.name}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-colors
                      ${
                        selectedSubcategoryId === subcategory._id
                          ? "text-green-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}

// ========================
// 🛒 Product Grid
// ========================
interface ProductGridProps {
  categoryName: string;
  subcategoryId: string | null;
}

function ProductGrid({
  categoryName,
  subcategoryId,
}: ProductGridProps) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [previousProducts, setPreviousProducts] = useState<ProductType[] | null>(null);
  
  // ✅ Direct fetch without activeFilters dependency
  const { products, isLoading, error, pagination } = useProducts(
    "limit=100", // Was empty filters string, added limit to fetch more products
    {
      categoryId: subcategoryId || undefined,
      enabled: !!subcategoryId,
    }
  );
  
  useEffect(() => {
    if (products && products.length > 0) {
      setPreviousProducts(products);
    }
  }, [products]);
  
  const displayProducts = products || previousProducts;
  const isFetching = isLoading && previousProducts !== null;

  const { profile } = useUserProfile();
  const {
    addItem,
    updateQuantity,
    cart: userCart,
    isLoading: cartLoading,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (userCart && userCart.cart?.items) {
      const newCartState: Record<string, number> = {};
      userCart.cart.items.forEach((item: any) => {
        newCartState[item.productId._id] = item.quantity;
      });
      setCart(newCartState);
    }
  }, [userCart]);

  const updateCart = (productId: string, change: number, variantId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const newCount = Math.max(current + change, 0);
      if (newCount >= 1 && newCount <= 5) {
        updateQuantity({
          productId,
          variantId,
          quantity: newCount,
        });
      } else if (newCount > 5) {
        updateQuantity({
          productId,
          variantId,
          quantity: 5,
        });
        toast.error("Maximum 5 items allowed in cart");
      } else {
        removeItem({ variantId: variantId as any });
      }

      if (newCount <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newCount };
    });
  };

  if (!subcategoryId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Select a category to view products
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Choose from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !displayProducts) {
    return (
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
        <div className="mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 md:p-4 border border-gray-200"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold mb-2 text-lg">
            Error loading products
          </p>
          <p className="text-gray-600 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-800 text-lg font-semibold mb-1">
            No products found
          </p>
          <p className="text-gray-500 text-sm">
            Check back later for new items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="mx-auto p-4 md:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {categoryName}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {displayProducts.length} products
              {pagination &&
                ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
            </p>
          </div>
          {isFetching && (
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 transition-opacity duration-300 ${
          isFetching ? 'opacity-60' : 'opacity-100'
        }`}>
          {displayProducts.map((product: ProductType) => {
            const defaultVariant =
              product.variants.find((v) => v.status === "AVAILABLE") ||
              product.variants[0];
            if (!defaultVariant) return null;

            const quantity = cart[product._id] || 0;
            const discount = defaultVariant.discountPercent || 0;
            const finalPrice =
              defaultVariant.discountedPrice || defaultVariant.price;
            const originalPrice = defaultVariant.mrp || defaultVariant.price;

            const isOutOfStock =
              defaultVariant.inventoryType === "LIMITED" &&
              defaultVariant.stock === 0;
            const availableStock =
              defaultVariant.inventoryType === "UNLIMITED"
                ? Infinity
                : defaultVariant.stock;
            const productImage =
              defaultVariant.images?.[0] ||
              product.mainImage ||
              product.images?.[0];
            const unitText =
              defaultVariant.measurement && defaultVariant.measurementUnit
                ? `${defaultVariant.measurement} ${defaultVariant.measurementUnit}`
                : defaultVariant.title;

            return (
              <Link
                href={`/product/${product.slug}`}
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 hover:shadow-md hover:border-green-200 transition-all duration-200 block group"
              >
                <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-gray-50">
                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                      {discount}% OFF
                    </span>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm md:text-base min-h-10">
                  {product.name}
                </h3>

                {unitText && (
                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    {unitText}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base md:text-lg font-bold text-gray-900">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  {originalPrice > finalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {quantity === 0 ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateCart(product._id, 1, defaultVariant._id);
                      addItem({
                        productId: product._id,
                        variantId: defaultVariant._id,
                      });
                    }}
                    disabled={isOutOfStock || !product.isActive}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock
                      ? "Out of Stock"
                      : !product.isActive
                      ? "Unavailable"
                      : "Add to Cart"}
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateCart(product._id, -1, defaultVariant._id);
                      }}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2.5 px-3 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-900 min-w-8 text-center">
                      {quantity > 5 ? "5" : quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateCart(product._id, 1, defaultVariant._id);
                      }}
                      disabled={
                        availableStock !== Infinity &&
                        quantity >= availableStock
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-3 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========================
// 🌳 Main Category Page (FIXED - NO FLICKER)
// ========================
export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  // ✅ Remove useFilter hook completely to avoid URL conflicts
  const subcategoryFromUrl = searchParams.get("subcategory");
  
  const isInitialized = useRef(false);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategory({
    type: TypeOfCategory.MASTER,
    tree: true,
  });

  const currentCategoryData = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    for (const master of categories) {
      if (master.children) {
        for (const superCat of master.children) {
          if (superCat.slug === slug) {
            return {
              category: superCat,
              subcategories: superCat.children || [],
            };
          }
          if (superCat.children) {
            for (const cat of superCat.children) {
              if (cat.slug === slug) {
                return {
                  category: cat,
                  subcategories: cat.children || [],
                };
              }
            }
          }
        }
      }
    }
    return null;
  }, [categories, slug]);

  // ✅ Initialize subcategory only once
  useEffect(() => {
    if (!currentCategoryData || isInitialized.current) return;

    const subcategories = currentCategoryData.subcategories;
    if (!subcategories || subcategories.length === 0) return;

    // Check if URL has subcategory param
    if (subcategoryFromUrl) {
      const exists = subcategories.some((sub) => sub._id === subcategoryFromUrl);
      if (exists) {
        setSelectedSubcategoryId(subcategoryFromUrl);
        isInitialized.current = true;
        return;
      }
    }

    // Default to first subcategory
    const firstSubcategoryId = subcategories[0]._id;
    setSelectedSubcategoryId(firstSubcategoryId);
    
    // ✅ Update URL silently
    router.replace(`${window.location.pathname}?subcategory=${firstSubcategoryId}`, {
      scroll: false,
    });
    
    isInitialized.current = true;
  }, [currentCategoryData, subcategoryFromUrl, router]);

  // ✅ Reset initialization when slug changes
  useEffect(() => {
    isInitialized.current = false;
    setSelectedSubcategoryId(null);
  }, [slug]);

  // ✅ Simplified subcategory selection - NO setFilter
  const handleSubcategorySelect = (subcategoryId: string) => {
    if (subcategoryId === selectedSubcategoryId) return;
    
    setSelectedSubcategoryId(subcategoryId);
    
    // ✅ Only update URL, no filter hook
    router.replace(`${window.location.pathname}?subcategory=${subcategoryId}`, {
      scroll: false,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="h-10 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <div className="aspect-square bg-gray-200 rounded mb-3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentCategoryData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Category Not Found
          </h1>
          <p className="text-gray-600">
            The category you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      <CategorySidebar
        category={currentCategoryData.category}
        subcategories={currentCategoryData.subcategories}
        selectedSubcategoryId={selectedSubcategoryId}
        onSubcategorySelect={handleSubcategorySelect}
      />
      <ProductGrid
        categoryName={currentCategoryData.category.name}
        subcategoryId={selectedSubcategoryId}
      />
    </div>
  );
}