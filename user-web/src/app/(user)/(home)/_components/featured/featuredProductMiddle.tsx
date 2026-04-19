"use client";

import Image from "next/image";
import { useFeatured } from "@/hooks/entities/useFeatured";
import { useCart } from "@/hooks/entities/useCart";
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/lib/store";
import { useAuth } from "@/hooks";

export function FeaturedProductMiddle() {
  const { selectedMasterCategoryId } = useAppSelector((state) => state.category);
  const { data: featured, isLoading, error } = useFeatured({ queryParams: "position=MIDDLE" });
  const { addItem, updateQuantity, removeItem, cart: userCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<Record<string, number>>({});

  // ✅ Sync local cart with backend cart
  useEffect(() => {
    if (userCart && userCart.cart?.items) {
      const newCartState: Record<string, number> = {};
      userCart.cart.items.forEach((item: any) => {
        newCartState[item.productId._id] = item.quantity;
      });
      setCart(newCartState);
    }
  }, [userCart]);

  // ✅ Add to Cart
  const handleAddToCart = async (productId: string, variantId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart.");
      return;
    }
    await addItem({ productId, variantId, quantity: 1 });
    setCart((prev) => ({ ...prev, [productId]: 1 }));
    toast.success("Added to cart!");
  };

  // ✅ Update Cart Quantity
  const updateCart = async (productId: string, change: number, variantId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to update your cart.");
      return;
    }

    setCart((prev) => {
      const current = prev[productId] || 0;
      const newCount = Math.max(current + change, 0);

      if (newCount >= 1) {
        updateQuantity({ productId, variantId, quantity: newCount });
      } else {
        removeItem({ variantId });
      }

      if (newCount <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newCount };
    });
  };

  // ✅ Filter featured by master category
  const filteredFeatured = useMemo(() => {
    if (!featured) return [];

    let filtered = [];
    if (!selectedMasterCategoryId) {
      filtered = featured.filter((item: any) => !item.masterCategory);
    } else {
      filtered = featured.filter((item: any) => item.masterCategory?._id === selectedMasterCategoryId);
    }

    filtered = filtered.filter((feature: any) => feature.mapType === "PRODUCT");
    return [...filtered].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [featured, selectedMasterCategoryId]);

  // ✅ Loading & Error states
  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 py-10">Failed to load featured products.</div>;

  if (!filteredFeatured?.length) return null;

  return (
    <section className="py-5">
      <div className="mx-auto px-3 md:px-6 lg:px-8 space-y-5">
        {filteredFeatured.map((feature: any) => {
          const bannerUrl = feature.imageUrl || "/placeholder.png";

          return (
            <div
              key={feature._id}
              className="relative overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 min-h-[300px] flex flex-col md:flex-row-reverse"
            >
              {/* Banner Section - Right Side */}
              <div className="w-full md:w-[33%] h-[200px] md:h-auto relative flex-shrink-0">
                <Image src={bannerUrl} alt={feature.title || "Featured Banner"} fill className="object-cover" />
              </div>

              {/* Product Scroll Section - Left Side */}
              <div
                className="w-full md:w-[67%] relative flex items-center overflow-hidden"
                style={{
                  background: feature.color || "#f9fafb",
                }}
              >
                {feature.bgImage && (
                  <Image
                    src={feature.bgImage}
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                  />
                )}

                {feature.mappings?.length > 0 && (
                  <div className="relative z-10 w-full h-full flex items-center">
                    {/* Left Scroll Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const container = document.getElementById(`scroll-${feature._id}`);
                        container?.scrollBy({ left: -300, behavior: "smooth" });
                      }}
                      id={`left-btn-${feature._id}`}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-gray-800 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full shadow-lg z-20 transition-all hover:scale-110 opacity-0 pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Right Scroll Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const container = document.getElementById(`scroll-${feature._id}`);
                        container?.scrollBy({ left: 300, behavior: "smooth" });
                      }}
                      id={`right-btn-${feature._id}`}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-gray-800 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full shadow-lg z-20 transition-all hover:scale-110"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Scroll Container */}
                    <div
                      id={`scroll-${feature._id}`}
                      className="h-full overflow-x-auto overflow-y-hidden flex gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 scrollbar-hide items-center scroll-smooth w-full"
                      onScroll={(e) => {
                        const container = e.currentTarget;
                        const leftBtn = document.getElementById(`left-btn-${feature._id}`);
                        const rightBtn = document.getElementById(`right-btn-${feature._id}`);
                        
                        if (leftBtn && rightBtn) {
                          // Show left button if scrolled from start
                          if (container.scrollLeft > 10) {
                            leftBtn.classList.remove('opacity-0', 'pointer-events-none');
                            leftBtn.classList.add('opacity-100', 'pointer-events-auto');
                          } else {
                            leftBtn.classList.add('opacity-0', 'pointer-events-none');
                            leftBtn.classList.remove('opacity-100', 'pointer-events-auto');
                          }
                          
                          // Hide right button if reached end
                          const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
                          if (isAtEnd) {
                            rightBtn.classList.add('opacity-0', 'pointer-events-none');
                            rightBtn.classList.remove('opacity-100', 'pointer-events-auto');
                          } else {
                            rightBtn.classList.remove('opacity-0', 'pointer-events-none');
                            rightBtn.classList.add('opacity-100', 'pointer-events-auto');
                          }
                        }
                      }}
                    >
                      {feature.mappings.map((map: any, idx: number) => {
                        const product = map.data;
                        if (!product) return null;

                        const imageUrl =
                          product.mainImage ||
                          product.thumbnail ||
                          (Array.isArray(product.images) ? product.images[0] : null) ||
                          "/placeholder.png";

                        const variantId = product.variants[0]?._id;
                        const inCart = cart[product._id] || 0;

                        const productSlug =
                          product.slug ||
                          product.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ||
                          product._id;

                        const link =
                          map?.type === "SUBCATEGORY" && feature.category
                            ? `/categories/${feature.category.slug}?status=all&categoryId=${product._id}`
                            : `/product/${productSlug}`;

                        // Calculate discount percentage
                        const discountPercent = product.variants[0].discountPercent || 
                          (product.variants[0].mrp && product.variants[0].discountedPrice 
                            ? Math.round(((product.variants[0].mrp - product.variants[0].discountedPrice) / product.variants[0].mrp) * 100)
                            : 0);

                        return (
                          <div
                            key={idx}
                            className="group flex-shrink-0 w-32 sm:w-36 md:w-40 flex flex-col bg-white rounded-lg p-3 transition cursor-pointer shadow-md hover:shadow-xl relative border border-gray-100"
                            onClick={() => router.push(link)}
                          >
                            {/* Discount Badge */}
                            {discountPercent > 0 && (
                              <div className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                {discountPercent}% OFF
                              </div>
                            )}

                            {/* Product Image */}
                            <div className="relative w-full h-24 sm:h-28 mb-2 flex items-center justify-center">
                              <Image
                                src={imageUrl}
                                alt={product.name || "Product"}
                                fill
                                unoptimized
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Product Name */}
                            <h3 className="text-xs font-medium text-gray-800 text-center line-clamp-2 mb-1.5 min-h-[32px]">
                              {product.name || "Untitled"}
                            </h3>

                            {/* Weight/Size */}
                            {product.variants[0]?.weight && (
                              <p className="text-[10px] text-gray-600 text-center mb-1.5">
                                {product.variants[0].weight} {product.variants[0].unit || "gm"}
                              </p>
                            )}

                            {/* Pricing */}
                            <div className="text-center mb-2">
                              {product.variants[0].discountedPrice ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-sm font-bold text-green-700">
                                      ₹{product.variants[0].discountedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 line-through">
                                      ₹{product.variants[0].mrp || product.variants[0].price}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-gray-800">
                                  ₹{product.variants[0].price?.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button */}
                            <div className="mt-auto">
                              {inCart > 0 ? (
                                <div className="flex items-center justify-between bg-green-600 rounded-md overflow-hidden">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCart(product._id, -1, variantId);
                                    }}
                                    className="text-white w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-green-700"
                                  >
                                    –
                                  </button>
                                  <span className="px-2 text-xs font-semibold text-white">
                                    {inCart}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCart(product._id, 1, variantId);
                                    }}
                                    className="text-white w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-green-700"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product._id, variantId);
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-md shadow transition flex items-center justify-center gap-1.5"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}