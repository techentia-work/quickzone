"use client";

import React from "react";
import { Loader2, Package, XCircle, Truck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useOrder } from "@/hooks/entities/useOrder";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OrdersPage() {
  const { orders, isLoading, cancelOrder } = useOrder();
  const router = useRouter();

  // ✅ Filter only delivered or cancelled
  const filteredOrders =
    orders
      ?.filter((o) => ["delivered", "cancelled"].includes(o.status.toLowerCase()))
    || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Loader2 className="animate-spin text-green-600 w-10 h-10" />
      </div>
    );
  }

  if (!filteredOrders.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center px-4">
        <Package className="w-14 h-14 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No completed or cancelled orders yet
        </h2>
        <p className="text-gray-500 text-base max-w-sm">
          Once your orders are delivered or cancelled, you'll see them here.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase();
    const styles: Record<string, string> = {
      delivered: "bg-green-100 text-green-700 border border-green-300",
      cancelled: "bg-red-100 text-red-700 border border-red-300",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${styles[lower] || "bg-gray-100 text-gray-700"
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white py-6 md:py-8">
      <div className="max-w-5xl mx-auto px-3 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Completed Orders
          </h1>
          <p className="text-gray-600">Delivered and cancelled orders</p>
        </div>

        <div className="space-y-5">
          {filteredOrders.map((order,idx) => (
            <Card
              key={order._id}
              onClick={() => router.push(`/profile/orders/${order._id}`)}
              className="bg-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
            >
              <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b bg-white px-5 py-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </CardHeader>

              <CardContent className="px-5 py-5 space-y-4">
                {/* Product Thumbnails */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(order as any).items?.slice(0, 3).map((item: any,idx:number) => (
                    <div key={item._id + idx} className="flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.productId?.name || "Product"}
                        width={70}
                        height={70}
                        className="rounded-lg border object-cover"
                      />
                    </div>
                  ))}
                  {(order as any).items?.length > 3 && (
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium">
                      +{(order as any).items.length - 3}
                    </div>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Total Paid
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Payment
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {order.paymentMethod} • {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {/* Shipping Info */}
                {order.shippingAddress && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">
                        Shipped To
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
