"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {ShoppingCart,Plus,Minus,ChevronLeft,ChevronRight,Star,Check,Home,Package,Truck,RefreshCw,Shield} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import {ProductVariantType,} from "@/lib/types/product/product.types";
import { VariantStatus } from "@/lib/types/product/product.enums";
import { useCart } from "@/hooks/entities/useCart";
import { useAuth, useUserProfile } from "@/hooks";
import toast from "react-hot-toast";
import { Footer } from "@/components";

// Hook to fetch product by slug
const useProductBySlug = (slug: string) => {
   
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: async () => (await productsApi.getBySlug(slug))?.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return { product: data, isLoading, error, refetch };
};

// Image Carousel Component
interface ImageCarouselProps {
  images: string[];
  productName: string;
}

function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <ShoppingCart className="w-24 h-24 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image Carousel */}
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-200" ref={emblaMainRef}>
          <div className="flex">
            {images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={image}
                    alt={`${productName} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      {images.length > 1 && (
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-2.5">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={`flex-[0_0_18%] min-w-0 relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                  ${
                    selectedIndex === index
                      ? "border-green-600 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Variant Selector Component
interface VariantSelectorProps {
  variants: ProductVariantType[];
  selectedVariant: ProductVariantType;
  onVariantSelect: (variant: ProductVariantType) => void;
}

function VariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
}: VariantSelectorProps) {
  if (!variants || variants.length <= 1) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Select Size</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {variants.map((variant) => {
          const isSelected = variant._id === selectedVariant._id;
          const isAvailable =
            variant.status === VariantStatus.AVAILABLE &&
            (variant.inventoryType === "UNLIMITED" || variant.stock > 0);

          const displayText =
            variant.title ||
            (variant.measurement && variant.measurementUnit
              ? `${variant.measurement} ${variant.measurementUnit}`
              : variant.sku);

          return (
            <button
              key={variant._id}
              onClick={() => onVariantSelect(variant)}
              disabled={!isAvailable}
              className={`relative p-3 rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? "border-green-600 bg-green-50 shadow-sm"
                    : isAvailable
                    ? "border-gray-200 hover:border-green-300 bg-white hover:shadow-sm"
                    : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate
                    ${isSelected ? "text-green-700" : "text-gray-900"}`}
                  >
                    {displayText}
                  </p>
                  <p
                    className={`text-base font-bold mt-0.5
                    ${isSelected ? "text-green-700" : "text-gray-900"}`}
                  >
                    ₹{(variant.discountedPrice || variant.price).toFixed(2)}
                  </p>
                  {variant.discountPercent > 0 && (
                    <p className="text-xs text-gray-500 line-through mt-0.5">
                      ₹{(variant.mrp || variant.price).toFixed(2)}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Similar Products Component
interface SimilarProductsProps {
  categoryId: string;
  currentProductId: string;
}

function SimilarProducts({ categoryId, currentProductId }: SimilarProductsProps) {
  const router = useRouter();
  const { addItem, cart: userCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const { data: products, isLoading, isFetching } = useQuery({
    queryKey: ["similar-products", categoryId, currentProductId],
    queryFn: async () => {
      const response = await productsApi.getAll(`categoryId=${categoryId}&limit=12`);
      return response?.data?.products?.filter((p: any) => p._id !== currentProductId) || [];
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep showing old data while loading new
  });

  const handleAddToCart = async (p: any) => {
    if (!p?._id) return;

    if (!isAuthenticated) {
      toast.error("Please login to add products to cart!");
      router.push("/login");
      return;
    }

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

  if (isLoading && !products) {
    return (
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Similar Products</h2>
        {isFetching && (
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 transition-opacity duration-300 ${
        isFetching ? 'opacity-50' : 'opacity-100'
      }`}>
        {products.map((p: any) => {
          const imageUrl =
            p.mainImage ||
            p.thumbnail ||
            (Array.isArray(p.images) ? p.images[0] : null) ||
            "/placeholder.png";

          const link = `/product/${p.slug}`;
          const isInCart = userCart?.cart.items?.some(
            (item: any) => item.productId._id === p._id
          );

          return (
            <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              {/* Product Image */}
              <div
                onClick={() => router.push(link)}
                className="relative w-full h-32 mb-2 cursor-pointer bg-gray-50 rounded-lg overflow-hidden"
              >
                <Image
                  src={imageUrl}
                  alt={p.name || "Product"}
                  fill
                  unoptimized
                  className="object-contain rounded-lg transition-transform duration-200 hover:scale-105"
                />
              </div>

              {/* Product Title */}
              <h3
                onClick={() => router.push(link)}
                className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 cursor-pointer hover:text-green-600 transition-colors duration-150"
              >
                {p.name}
              </h3>

              {/* Product Price */}
              <div className="mt-auto">
                {p.variants?.[0]?.discountedPrice ? (
                  <div className="flex flex-col mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-gray-900">
                        ₹{p.variants[0].discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{p.variants[0].mrp || p.price}
                      </span>
                    </div>
                    {p.variants[0].discountPercent && (
                      <span className="text-xs font-medium text-green-600">
                        {p.variants[0].discountPercent}% OFF
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mb-2">
                    <span className="text-base font-bold text-gray-900">
                      ₹{p.variants?.[0]?.price?.toFixed(2) ?? p.price}
                    </span>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={addingProductId === p._id || isInCart}
                  className={`text-sm font-medium flex items-center gap-1.5 justify-center w-full py-2 rounded-lg transition-all duration-200 ${
                    isInCart
                      ? "bg-green-100 text-green-700 cursor-default"
                      : addingProductId === p._id
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check size={16} /> In Cart
                    </>
                  ) : addingProductId === p._id ? (
                    "Adding..."
                  ) : (
                    <>
                      <ShoppingCart size={16} /> Add
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
}

// Main Product Page Component
export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { product, isLoading, error } = useProductBySlug(slug);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantType | null>(null);
  const [quantity, setQuantity] = useState(0);

  // Set initial variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const availableVariants = product.variants.map((v) => {
        if (v.status === "AVAILABLE" && v.stock > 0) {
          return v;
        }
      });

      setSelectedVariant(availableVariants[0] as any);
    }
  }, [product]);

  const handleVariantChange = (variant: ProductVariantType) => {
    setSelectedVariant(variant);
  };

  const { profile } = useUserProfile();

  const [cart, setCart] = useState<Record<string, number>>({});
  const {
    cart: userCart,
    addItem,
    updateQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
  if (userCart?.cart?.items) {
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
      }
      else if(newCount > 5) {
        updateQuantity({
          productId,
          variantId,
          quantity: 5,
        })
        toast.error("Maximum 5 items allowed in cart");
      }
       else {
        removeItem({ variantId: (selectedVariant as any)?._id });
      }

      if (newCount <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newCount };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse mb-3" />
              <div className="flex gap-2.5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="space-y-5">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Variants Available
          </h1>
          <p className="text-gray-600 mb-6">
            This product has no available variants.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get all images (variant images + product images)
  const allImages = [
    ...(selectedVariant.images || []),
    ...(product.images || []),
  ].filter((img, index, self) => img && self.indexOf(img) === index); // Remove duplicates

  const finalPrice = selectedVariant.discountedPrice || selectedVariant.price;
  const originalPrice = selectedVariant.mrp || selectedVariant.price;
  const discount = selectedVariant.discountPercent || 0;

  const isOutOfStock =
    selectedVariant.status === VariantStatus.SOLD_OUT ||
    (selectedVariant.inventoryType === "LIMITED" &&
      selectedVariant.stock === 0);

  const availableStock =
    selectedVariant.inventoryType === "UNLIMITED"
      ? Infinity
      : selectedVariant.stock;

  const Quantity = cart[product._id] || 0;

  const maxQuantity =
    selectedVariant.inventoryType === "UNLIMITED" ? 99 : selectedVariant.stock;

  // Get category name
  const categoryName =
    typeof product.categoryId === "object"
      ? product.categoryId.name
      : "Category";

  const categorySlug =
    typeof product.categoryId === "object" ? product.categoryId.slug : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
            <li>
              <Link href="/" className="hover:text-green-600 transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <li>
              {categorySlug ? (
                <Link
                  href={`/categories/${categorySlug}`}
                  className="hover:text-green-600 transition-colors"
                >
                  {categoryName}
                </Link>
              ) : (
                <span>{categoryName}</span>
              )}
            </li>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <li className="text-gray-900 font-medium truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Images - Takes 3 columns */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <ImageCarousel images={allImages} productName={product.name} />
          </div>

          {/* Right: Product Info - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-5">
            {/* Product Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Title & Brand */}
              <div className="mb-4">
                {product.brand && (
                  <p className="text-sm text-green-600 font-medium mb-1">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              {product.ratings && product.ratings.count > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-lg text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{product.ratings.avg.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  {originalPrice > finalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
              </div>

              {/* Variant Selector */}
              <div className="mb-4">
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantSelect={handleVariantChange}
                />
              </div>

              {/* Add to Cart Button */}
            {userCart?.cart?.items?.some(
  (it) => it.variantId === selectedVariant?._id
              ) ? (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateCart(product._id, -1, selectedVariant._id);
                      }}
                      className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <span className="font-bold text-xl text-gray-900 min-w-[2.5rem] text-center">
                      {Quantity > 5 ? "5" : Quantity}
                    </span>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        updateCart(product._id, 1, selectedVariant._id);
                      }}
                      disabled={
                        availableStock !== Infinity && quantity >= availableStock
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({
                      productId: product._id,
                      variantId: selectedVariant._id,
                    });
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              )}

              {/* Features */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  {product.isReturnable && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                      <RefreshCw className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Easy Returns</span>
                    </div>
                  )}
                  {product.isCOD && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                      <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Cash on Delivery</span>
                    </div>
                  )}
                  {product.isCancelable && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Cancelable</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            {product.shortDescription && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  About this product
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Product Information
              </h3>
              <div className="space-y-2.5">
                {selectedVariant.sku && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-medium text-gray-900">
                      {selectedVariant.sku}
                    </span>
                  </div>
                )}
                {product.manufacturer && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manufacturer</span>
                    <span className="font-medium text-gray-900">
                      {product.manufacturer}
                    </span>
                  </div>
                )}
                {product.madeIn && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Made In</span>
                    <span className="font-medium text-gray-900">
                      {product.madeIn}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="prose max-w-none text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        <SimilarProducts 
          categoryId={typeof product.categoryId === "object" ? product.categoryId._id : product.categoryId}
          currentProductId={product._id}
        />

        <Footer/>
      </div>
    </div>
  );
}