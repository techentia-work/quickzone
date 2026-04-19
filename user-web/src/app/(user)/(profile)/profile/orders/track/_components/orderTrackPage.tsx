"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Truck, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { socketClientUtils } from "@/lib/utils/socket.client.utils";
import { useOrder } from "@/hooks/entities/useOrder";
import { OrderResponse } from "@/lib/types/order/order.types";
import { useUserProfile } from "@/hooks";

// ── Leaflet map components (SSR off) ─────────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

const containerStyle = { width: "100%", height: "380px" };

// ── Nominatim forward-geocode (free, no key) ─────────────────────────────────
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

export default function TrackOrderPage({ id }: { id: string }) {
  const { getOrderById, isLoading, isError } = useOrder();
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [hasArrived, setHasArrived] = useState(false);

  const { profile } = useUserProfile();

  // ── Fetch order and geocode destination ──────────────────────────────────
  useEffect(() => {
    if (!id || !profile?._id) return;
    const fetchOrder = async () => {
      try {
        const order = await getOrderById(id);
        if (!order) return;
        const o = (order as any).order;
        setOrderDetails(o);

        if (o.shippingAddress?.googleLocation) {
          const coords = await geocodeAddress(o.shippingAddress.googleLocation);
          if (coords) setDestination(coords);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrder();
  }, [id, profile?._id]);

  // ── Live driver location via socket ──────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const socket = socketClientUtils.getSocket();
    socketClientUtils.joinRoom(`order:${id}`);

    socket.on("order:location:update", (data: any) => {
      if (data?.lat && data?.lng) {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socketClientUtils.leaveRoom(`order:${id}`);
      socket.off("order:location:update");
    };
  }, [id]);

  // ── Check arrival (≤ 100 m) ───────────────────────────────────────────────
  useEffect(() => {
    if (!driverLocation || !destination) return;
    const R = 6371000;
    const dLat = ((destination.lat - driverLocation.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - driverLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((driverLocation.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setHasArrived(dist <= 100);
  }, [driverLocation, destination]);

  useEffect(() => {
    if (hasArrived) {
      const audio = new Audio("/ding.mp3");
      audio.play().catch(() => {});
    }
  }, [hasArrived]);

  // ── Map center: prefer driver, else destination ───────────────────────────
  const mapCenter = driverLocation ?? destination ?? { lat: 27.1767, lng: 78.0081 };

  if (isLoading)
    return <div className="flex justify-center items-center h-screen text-gray-500">Loading…</div>;
  if (isError)
    return <div className="flex justify-center items-center h-screen text-red-600">Failed to load order details.</div>;
  if (!orderDetails)
    return <div className="flex justify-center items-center h-screen text-gray-500">Order not found.</div>;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Arrival Banner */}
      {hasArrived && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">🎉 Your order has arrived!</span>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Order Status</p>
            <p className="text-lg font-semibold text-gray-800">{orderDetails.status}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Order #{orderDetails.orderNumber}</p>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {orderDetails.status}
          </span>
        </div>
      </div>

      {/* Delivery Partner */}
      {orderDetails.assignedDeliveryBoy && (
        <div className="mx-3 mt-5 bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Delivery Partner</h2>
            <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              On the way
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-700 text-xl font-bold">
              {orderDetails.assignedDeliveryBoy.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{orderDetails.assignedDeliveryBoy.name}</p>
              <p className="text-sm text-gray-600">📞 {orderDetails.assignedDeliveryBoy.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {(driverLocation || destination) && (
        <div className="mx-3 mt-4 rounded-xl overflow-hidden shadow-md" style={containerStyle}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {driverLocation && (
              <Marker position={[driverLocation.lat, driverLocation.lng]}>
                <Popup>🚚 {orderDetails.assignedDeliveryBoy?.name || "Driver"}</Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={[destination.lat, destination.lng]}>
                <Popup>📍 Delivery Address</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      {/* Order Details */}
      <div className="mx-3 mt-4 space-y-4">
        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Ordered Items</h3>
          <div className="divide-y divide-gray-100">
            {orderDetails.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.productId?.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{item.discountedPrice || item.price}</p>
                  {item.discountedPrice && (
                    <p className="text-xs text-gray-400 line-through">₹{item.price}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-green-600 w-5 h-5" />
            <h3 className="text-base font-semibold text-gray-800">Delivery Address</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {orderDetails.shippingAddress.fullName}
            <br />
            {orderDetails.shippingAddress.googleLocation}
          </p>
          <p className="text-xs text-gray-500 mt-1">📞 {orderDetails.shippingAddress.phone}</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="text-green-600 w-5 h-5" />
            <h3 className="text-base font-semibold text-gray-800">Payment Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{orderDetails.subTotal || 0}</span>
            </div>
            {(orderDetails.handlingCharge || 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Handling Charge</span>
                <span>₹{orderDetails.handlingCharge}</span>
              </div>
            )}
            {(orderDetails.deliveryCharge || 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span>₹{orderDetails.deliveryCharge}</span>
              </div>
            )}
            {(orderDetails.walletDeduction || 0) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Wallet Deduction</span>
                <span className="text-red-600">-₹{orderDetails.walletDeduction}</span>
              </div>
            )}
            {(orderDetails.onlinePaid || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Online Paid</span>
                <span className="text-blue-700 font-medium">₹{orderDetails.onlinePaid}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between text-gray-900 font-semibold">
              <span>Total Amount</span>
              <span className="text-green-700">₹{orderDetails.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2 pt-2 border-t">
              <span>Payment Method</span>
              <span className="font-medium text-gray-800">{orderDetails.paymentMethod || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment Status</span>
              <span className={`font-medium ${orderDetails.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                {orderDetails.paymentStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
