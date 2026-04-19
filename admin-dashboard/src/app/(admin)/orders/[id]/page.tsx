"use client";

import { useParams } from "next/navigation";
import { Loader2, User, MapPin, CreditCard, Package, Truck, IndianRupee } from "lucide-react";
import { useAdminOrder } from "@/hooks/entities/useAdminOrder";

export default function AdminOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrderByIdQuery } = useAdminOrder();
  const res = getOrderByIdQuery(id);

  const order = res.data;

  const formatDate = (date?: string | Date) =>
    date ? new Date(date).toLocaleString() : "—";

  if (res.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!order)
    return (
      <div className="text-center py-10 text-gray-500">
        Order not found or failed to load.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Order #{order.orderNumber}
        </h1>
        <span className="text-sm text-gray-500">
          Placed on {formatDate(order.createdAt)}
        </span>
      </div>

      {/* GRID SECTIONS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CUSTOMER */}
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <User className="w-5 h-5 text-blue-500" /> Customer Details
          </div>
          <p className="text-gray-700 font-medium">
            {order.userId?.name || "Unknown"}
          </p>
          <p className="text-gray-500 text-sm">{order.userId?.email}</p>
          <p className="text-gray-500 text-sm">{order.userId?.phone}</p>
        </div>

        {/* ORDER STATUS */}
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Package className="w-5 h-5 text-indigo-500" /> Order Status
          </div>
          <div className="space-y-1">
            <p>
              <span className="font-medium text-gray-700">Status:</span>{" "}
              <span className="text-gray-800">{order.status}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Payment:</span>{" "}
              <span className="text-gray-800">{order.paymentStatus}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Method:</span>{" "}
              <span className="text-gray-800">{order.paymentMethod}</span>
            </p>
          </div>
        </div>

        {/* SHIPPING INFO */}
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MapPin className="w-5 h-5 text-green-500" /> Shipping Address
          </div>
          <div className="text-gray-700 leading-relaxed">
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.pincode}
            </p>
            <p>{order.shippingAddress?.country}</p>
            <p className="text-sm text-gray-500 mt-1">
              📞 {order.shippingAddress?.phone}
            </p>
          </div>
        </div>
      </div>

      {/* ORDER ITEMS */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <Truck className="w-5 h-5 text-orange-500" /> Ordered Items
        </div>

        {order.items?.length > 0 ? (
          <div className="divide-y">
            {order.items.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 transition"
              >
                {/* <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                  <Image
                    src={"https://picsum.photos/id/237/200/300"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div> */}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.variantTitle || ""}
                  </p>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700 font-medium">
                    ₹{item.price?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No items found.</p>
        )}
      </div>

      {/* PAYMENT SUMMARY */}
      {/* PAYMENT SUMMARY */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <CreditCard className="w-5 h-5 text-purple-500" /> Payment Summary
        </div>

        <div className="space-y-2 text-gray-700">

          {/* Sub Total */}
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subTotal?.toFixed(2)}</span>
          </div>

          {/* Tax */}
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{order.totalTax?.toFixed(2)}</span>
          </div>

          {/* Handling Charge */}
          <div className="flex justify-between">
            <span>Handling Charge</span>
            <span>₹{order.handlingCharge?.toFixed(2)}</span>
          </div>

          {/* Delivery Charge */}
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span>₹{order.deliveryCharge?.toFixed(2)}</span>
          </div>

          {/* Applied Promo Code */}
          {order.appliedPromo?.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo Discount ({order.appliedPromo.code})</span>
              <span>-₹{order.appliedPromo.discountAmount?.toFixed(2)}</span>
            </div>
          )}

          {/* PromoCash Used */}
          {order.promoUsed > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>PromoCash Used</span>
              <span>-₹{order.promoUsed.toFixed(2)}</span>
            </div>
          )}

          {/* Wallet Used (Real Balance) */}
          {order.walletUsed > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Wallet Used</span>
              <span>-₹{order.walletUsed.toFixed(2)}</span>
            </div>
          )}

          {/* Wallet Total Used */}
          {order.walletTotalUsed > 0 && (
            <div className="flex justify-between text-gray-700 text-sm">
              <span>Total Wallet Deduction</span>
              <span>-₹{order.walletTotalUsed.toFixed(2)}</span>
            </div>
          )}

          {/* Online Paid */}
          {order.onlinePaid > 0 && (
            <div className="flex justify-between text-indigo-600">
              <span>Online Paid</span>
              <span>₹{order.onlinePaid.toFixed(2)}</span>
            </div>
          )}

          {/* COD Remaining */}
          {order.remainingCOD > 0 && (
            <div className="flex justify-between text-red-600">
              <span>COD Amount</span>
              <span>₹{order.remainingCOD.toFixed(2)}</span>
            </div>
          )}

          {/* Final Total */}
          <div className="border-t pt-2 flex justify-between font-semibold text-lg text-gray-900">
            <span>Total Amount</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
