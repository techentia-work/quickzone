"use client";

import { Button } from "@/components/ui/button/Button";
import { useAuth } from "@/hooks";
import { useCart } from "@/hooks/entities/useCart";
import { Loader2, Tag, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePromo } from "@/hooks/entities/usePromo";
import { CheckoutDialog, LeftSection } from "./_components";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, isLoading, clearCart } = useCart();

  const {
    applyPromo,
    removePromo,
    validatePromo,
    isApplying,
    isRemoving
  } = usePromo(user?._id ?? "");

  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  const {
    subtotal,
    deliveryCharge,
    handlingCharge,
    totalAmount,
    backendPromo,
    discount
  } = useMemo(() => {
    const c = cart?.cart;

    return {
      subtotal: c?.subTotal ?? 0,
      deliveryCharge: c?.deliveryCharge ?? 0,
      handlingCharge: c?.handlingCharge ?? 0,
      totalAmount: c?.totalAmount ?? 0,
      backendPromo: c?.appliedPromo ?? null,
      discount: c?.appliedPromo?.discountAmount ?? 0
    };
  }, [cart?.cart]);

  // Sync backend promo to local promo state
  useEffect(() => {
    if (backendPromo?.code) {
      setAppliedPromo(backendPromo);
    }
  }, [backendPromo]);

  // Validate promo when cart subtotal changes
  useEffect(() => {
    async function validate() {
      if (appliedPromo && promoCode) {
        const res = await validatePromo({ code: promoCode });

        if (!res.success) {
          handleRemovePromo();
        }
      }
    }
    validate();
  }, [subtotal]);

  // -------------------------------
  // APPLY PROMO
  // -------------------------------
  const handleApplyPromo = async () => {
    try {
      const res = await applyPromo({ code: promoCode });

      if (res.success) {
        toast.success("Promo applied!");
        setAppliedPromo({
          code: promoCode,
          discountAmount: res.data?.discount || 0
        });
      } else {
        toast.error(res.message || "Invalid promo code");
        setPromoCode("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid promo code");
    }
  };

  // -------------------------------
  // REMOVE PROMO
  // -------------------------------
  const handleRemovePromo = async () => {
    try {
      await removePromo();
      toast.success("Promo removed");
      setAppliedPromo(null);
      setPromoCode("");
    } catch {
      toast.error("Failed to remove promo");
    }
  };

  // -------------------------------
  // LOADING
  // -------------------------------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  // -------------------------------
  // EMPTY CART
  // -------------------------------
  if (!cart || !cart.cart?.items?.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md flex flex-col items-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">Start shopping to fill it up!</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------
  // UI RETURN
  // -------------------------------
  return (
    <div className="min-h-screen bg-white py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <span className="text-sm text-gray-600">
            {cart.cart.items.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-3">
            <LeftSection cart={cart.cart} />
          </div>

          {/* RIGHT SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 pb-4 border-b border-gray-200">
                <SummaryRow label="Subtotal" value={subtotal} />
                <SummaryRow label="Handling Charges" value={handlingCharge} />
                <SummaryRow label="Delivery Charges" value={deliveryCharge} />

                {appliedPromo && (
                  <SummaryRow
                    label="Promo Discount"
                    value={discount}
                    negative
                  />
                )}
              </div>

              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <span className="text-base font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              {/* PROMO SECTION */}
              <PromoCodeSection
                appliedPromo={appliedPromo}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                isApplying={isApplying}
                handleApplyPromo={handleApplyPromo}
                handleRemovePromo={handleRemovePromo}
              />

              {/* BUTTONS */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg"
                  onClick={() => clearCart({ userId: user?._id ?? "" })}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT POPUP */}
      <CheckoutDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
    </div>
  );
}

// --------------------------------------
// SMALL COMPONENTS
// --------------------------------------

function SummaryRow({
  label,
  value,
  negative = false
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={negative ? "text-green-600" : "text-gray-600"}>
        {label}
      </span>
      <span
        className={
          negative ? "font-semibold text-green-600" : "font-medium text-gray-900"
        }
      >
        {negative ? "-" : ""}₹{value.toFixed(2)}
      </span>
    </div>
  );
}

function PromoCodeSection({
  appliedPromo,
  promoCode,
  setPromoCode,
  isApplying,
  handleApplyPromo,
  handleRemovePromo
}: any) {
  return appliedPromo ? (
    <div className="py-4 border-b border-gray-200">
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {appliedPromo.code}
          </span>
        </div>
        <button
          onClick={handleRemovePromo}
          className="text-xs font-semibold text-green-700 hover:text-green-800 px-2 py-1 hover:bg-green-100 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  ) : (
    <div className="py-4 border-b border-gray-200">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Have a promo code?
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button
            onClick={handleApplyPromo}
            disabled={!promoCode || isApplying}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {isApplying ? "..." : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
