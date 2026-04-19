"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/hooks/entities/useOrder";
import { Button } from "@/components/ui/button/Button";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Truck,
  Package,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getOrderById, isLoading, cancelOrder } = useOrder();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const func = async () => {
      const order = await getOrderById(params.id as string);
      setOrder((order as any).order);
    };
    func();
  }, [isLoading]);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <Loader2 className="animate-spin w-10 h-10 text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center px-4">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Order not found</h2>
        <Button onClick={() => router.push("/orders")} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const canBeCancelled = ["pending", "confirmed"].includes(order.status);

  return (
    <div className="min-h-screen bg-white py-6 md:py-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full capitalize ${
              order.status === "DELIVERED"
                ? "bg-green-100 text-green-700 border border-green-300"
                : order.status === "CANCELLED"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
            }`}
          >
            {order.status.toLowerCase()}
          </span>
        </div>

        {/* Order Info */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Order #{order.orderNumber}
          </h1>
          <p className="text-sm text-gray-600 mb-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-600">
            Payment:{" "}
            <span className="font-medium">
              {order.paymentMethod} • {order.paymentStatus}
            </span>
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Items in this Order
          </h2>
          <div className="divide-y divide-gray-100">
            {(order as any).items?.map((item: any) => (
              <div
                key={item._id}
                className="flex items-center gap-4 py-4 cursor-pointer hover:bg-white rounded-lg transition"
                onClick={() => router.push(`/product/${item.productId.slug}`)}
              >
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.productId?.name || "Product"}
                  width={70}
                  height={70}
                  className="rounded-md object-cover border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.productId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ₹{item.quantity * item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        {order.shippingAddress && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Shipping Address
              </h2>
            </div>
            <p className="text-sm text-gray-700">
              {order.shippingAddress.addressLine1}
            </p>
            <p className="text-sm text-gray-700">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </p>
            <p className="text-sm text-gray-700">
              📞 {order.shippingAddress.phone}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Summary
          </h2>
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span>Subtotal</span>
            <span>₹{order.subTotal}</span>
          </div>
          {/* <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span>Tax</span>
            <span>₹{order.totalTax}</span>
          </div> */}
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span>Delivery Fee</span>
            <span>₹{order.shippingCharges}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-gray-900 mt-3 border-t pt-3">
            <span>Total Paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Cancel / Delivered */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          {canBeCancelled ? (
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await cancelOrder({
                    orderId: order._id,
                    payload: { reason: "User requested cancellation" },
                  });
                  toast.success("Order cancelled successfully");
                } catch {
                  toast.error("Failed to cancel order");
                }
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </Button>
          ) : order.status === "DELIVERED" ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm py-2 px-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              Successfully Delivered
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
