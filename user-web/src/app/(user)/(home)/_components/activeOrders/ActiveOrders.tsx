"use client";

import { useEffect, useState } from "react";
import { useOrder } from "@/hooks/entities/useOrder";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button/Button";
import { Loader2, Truck, X } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function ActiveOrdersBookmark() {
  const { user } = useAuth();
  const { orders, refetch, isLoading } = useOrder();
  const [open, setOpen] = useState(false);

  const activeOrders =
  orders?.filter(
    (order) =>
      order.status === "CONFIRMED" ||
      order.status === "PROCESSING" ||
      order.status === "OUT_FOR_DELIVERY"
  ) || [];

  useEffect(() => {
    if (user?._id) {
      refetch();
      const interval = setInterval(() => refetch(), 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const router = useRouter();

  if (!user || activeOrders.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
        title="View Active Orders"
      >
        <Truck className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {activeOrders.length}
        </span>
      </div>

      {/* Active Orders Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[420px] p-0 flex flex-col !z-[99999]"
        >
          <SheetHeader className="flex items-center justify-between p-4 border-b bg-white">
            <SheetTitle className="text-lg font-semibold">
              Active Orders
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto bg-white p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : (
              activeOrders.map((order, idx) => (
                <div
                  key={order._id + idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-green-600 text-sm font-medium">
                      {order.status.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600">
                    ₹{order.totalAmount} • {order.paymentMethod} (
                    {order.paymentStatus})
                  </p>

                  {/* Product List */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {(order as any).items?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => {
                          router.push(`/product/${item.productId.slug}`);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Image
                          src={item.image || "/placeholder.png"}
                          alt={item.productId?.name || "Product"}
                          width={60}
                          height={60}
                          className="rounded-md object-cover border border-gray-200"
                        />
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="text-right">
                    <Button
                      onClick={() =>
                        router.push(`/profile/orders/track/${order._id}`)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg"
                    >
                      Track Order
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
