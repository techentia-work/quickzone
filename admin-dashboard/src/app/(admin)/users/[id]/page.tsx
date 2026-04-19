"use client";

import { useAdminUser } from "@/hooks/entities/useAdminUser";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { userDetails, isLoading, error } = useAdminUser(userId);
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg">Loading user details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-600">
        Failed to load user details
      </div>
    );

  if (!userDetails)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        No user data found.
      </div>
    );

  const { profile, wallet, orders, addresses, cart, transactions } =
    userDetails as any;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">
        👤 User: {profile?.fullName || "N/A"}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="flex flex-wrap gap-2 bg-white shadow-sm p-2 rounded-lg">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="cart">Cart</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
              <p>
                <strong>Full Name:</strong> {profile.fullName}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Role:</strong> {profile.role}
              </p>
              <p>
                <strong>Status:</strong> {profile.status}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(profile.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Verified Email:</strong>{" "}
                {profile.isEmailVerified ? "✅ Yes" : "❌ No"}
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* WALLET TAB */}
        <TabsContent value="wallet">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet</h2>
            <div className="flex gap-6 text-gray-700">
              <p>
                <strong>Balance:</strong> ₹{wallet.balance.toFixed(2)}
              </p>
              <p>
                <strong>Promo Cash:</strong> ₹{wallet.promoCash.toFixed(2)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transactions</h2>
            <div className="flex gap-6 text-gray-700">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Balance After</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn: any) => (
                        <tr
                          key={txn._id}
                          className="border-t hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className={`px-4 py-3 font-medium ${
                              txn.type === "CREDIT"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {txn.type}
                          </td>
                          <td className="px-4 py-3">{txn.source || "N/A"}</td>
                          <td
                            className={`px-4 py-3 font-semibold ${
                              txn.type === "CREDIT"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {txn.type === "CREDIT" ? "+" : "-"}₹
                            {txn.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-800">
                            ₹{txn.balanceAfter?.toFixed(2) ?? "—"}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                txn.status === "SUCCESS"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(txn.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {txn.description || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No transactions found.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Orders ({orders.length})
            </h2>
            {orders.length > 0 ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-semibold">
                        #{order.orderNumber} —{" "}
                        <span
                          className={`${
                            order.status === "DELIVERED"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p>
                      <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)} (
                      {order.paymentStatus})
                    </p>

                    {/* Items */}
                    <div className="mt-3 space-y-2">
                      {order.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 border-t pt-2 mt-2"
                        >
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={50}
                            height={50}
                            className="rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              {item.variantTitle} × {item.quantity} — ₹
                              {item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No orders found.</p>
            )}
          </Card>
        </TabsContent>

        {/* ADDRESSES TAB */}
        <TabsContent value="addresses">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Addresses</h2>
            {addresses.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr: any) => (
                  <li
                    key={addr._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="font-semibold">{addr.label}</p>
                    <p>{addr.formattedAddress}</p>
                    <p>
                      {addr.city}, {addr.state}, {addr.country} - {addr.pincode}
                    </p>
                    <p>
                      📞 <strong>{addr.phone}</strong>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No saved addresses.</p>
            )}
          </Card>
        </TabsContent>

        {/* CART TAB */}
        <TabsContent value="cart">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cart</h2>
            {cart?.items?.length > 0 ? (
              <ul className="space-y-3">
                {cart.items.map((item: any, i: number) => (
                  <li key={i} className="flex items-center gap-4 border-b pb-2">
                    <Image
                      src={item.productId.mainImage}
                      alt={item.productName}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.title} × {item.quantity} — ₹
                        {item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
                <div>
                  <p className="font-semibold mt-4">
                    Subtotal: ₹{cart.subTotal.toFixed(2)}
                  </p>
                  <p className="font-semibold">
                    Total Tax: ₹{cart.totalTax.toFixed(2)}
                  </p>
                  {cart.appliedPromo && cart.appliedPromo.discountAmount && (
                    <p className="font-semibold">
                      Promo Discount: -₹
                      {cart.appliedPromo.discountAmount.toFixed(2)}
                    </p>
                  )}
                  {cart.deliveryfee && (
                    <p className="font-semibold">
                      Delivery Fee: ₹{cart.deliveryfee.toFixed(2)}
                    </p>
                  )}
                  <p className="font-bold text-lg">
                    Total Amount: ₹{cart.totalAmount.toFixed(2)}
                  </p>
                </div>
              </ul>
            ) : (
              <p className="text-gray-600">Cart is empty.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
