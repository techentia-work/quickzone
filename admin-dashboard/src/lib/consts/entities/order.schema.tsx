import { FilterSchema } from "@/lib/types";
import { OrderStatus, PaymentStatus } from "@/lib/types/order/order.enums";
import { OrderType } from "@/lib/types/order/order.types";
import { Eye, Edit, Trash2 } from "lucide-react";
import React from "react";

export const orderEntitySchema: FilterSchema = {
  sections: ["Basic", "Customer", "Payment", "Delivery", "Date Range"],

  fields: [
    // === BASIC SECTION ===
    {
      key: "status",
      label: "Order Status",
      type: "select",
      section: "Basic",
      options: [
        { value: "all", label: "All" },
        { value: "PENDING", label: "Pending" },
        { value: "CONFIRMED", label: "Confirmed" },
        { value: "PROCESSING", label: "Processing" },
        { value: "SHIPPED", label: "Shipped" },
        { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
        { value: "DELIVERED", label: "Delivered" },
        { value: "CANCELLED", label: "Cancelled" },
        { value: "REFUNDED", label: "Refunded" },
        { value: "FAILED", label: "Failed" },
      ],
      defaultValue: "all",
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select",
      section: "Basic",
      options: [
        { value: "", label: "All" },
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
        { value: "FAILED", label: "Failed" },
        { value: "REFUNDED", label: "Refunded" },
      ],
      defaultValue: "",
    },
    {
      key: "isCOD",
      label: "Cash on Delivery",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      type: "range",
      section: "Basic",
      rangeConfig: { min: 0, max: 100000, step: 100, prefix: "₹" },
    },

    // === CUSTOMER SECTION ===
    {
      key: "userId",
      label: "Customer ID",
      type: "text",
      section: "Customer",
      placeholder: "Filter by user ID",
    },
    {
      key: "shippingAddress.fullName",
      label: "Customer Name",
      type: "text",
      section: "Customer",
      placeholder: "Search by name",
    },
    {
      key: "shippingAddress.phone",
      label: "Customer Phone",
      type: "text",
      section: "Customer",
      placeholder: "Search by phone number",
    },

    // === PAYMENT SECTION ===
    {
      key: "paymentMethod",
      label: "Payment Method",
      type: "select",
      section: "Payment",
      options: [
        { value: "", label: "All Methods" },
        { value: "COD", label: "Cash on Delivery" },
        { value: "ONLINE", label: "Online" },
        { value: "WALLET", label: "Wallet" },
      ],
      defaultValue: "",
    },
    {
      key: "taxRate",
      label: "Tax Rate",
      type: "select",
      section: "Payment",
      options: [
        { value: "", label: "All" },
        { value: "gst_5", label: "GST 5%" },
        { value: "gst_12", label: "GST 12%" },
        { value: "gst_18", label: "GST 18%" },
        { value: "gst_28", label: "GST 28%" },
      ],
      defaultValue: "",
    },

    // === DELIVERY SECTION ===
    {
      key: "shippingAddress.city",
      label: "City",
      type: "text",
      section: "Delivery",
      placeholder: "Filter by city",
    },
    {
      key: "shippingAddress.state",
      label: "State",
      type: "text",
      section: "Delivery",
      placeholder: "Filter by state",
    },

    // === DATE RANGE SECTION ===
    {
      key: "dateRange",
      label: "Quick Date Range",
      type: "select",
      section: "Date Range",
      options: [
        { value: "", label: "All Time" },
        { value: "7d", label: "Last 7 Days" },
        { value: "30d", label: "Last 30 Days" },
        { value: "3m", label: "Last 3 Months" },
        { value: "6m", label: "Last 6 Months" },
        { value: "1y", label: "Last Year" },
        { value: "custom", label: "Custom Range" },
      ],
      defaultValue: "",
    },
    {
      key: "dateFrom",
      label: "From Date",
      type: "date",
      section: "Date Range",
    },
    { key: "dateTo", label: "To Date", type: "date", section: "Date Range" },
  ],

  defaultFilters: {
    search: "",
    status: ["PENDING", "CONFIRMED", "ACCEPTED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "REJECTED"],
    paymentStatus: "",
    paymentMethod: "",
    taxRate: "",
    userId: "",
    "shippingAddress.fullName": "",
    "shippingAddress.phone": "",
    "shippingAddress.city": "",
    "shippingAddress.state": "",
    totalAmount: { gte: undefined, lte: undefined },
    isCOD: undefined,
    dateRange: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  statsCards: [
    {
      key: "counts.totalOrders",
      title: "Total Orders",
      icon: "ShoppingBag",
      color: "bg-blue-500",
    },
    {
      key: "counts.pendingOrders",
      title: "Pending Orders",
      icon: "Clock",
      color: "bg-yellow-500",
    },
    {
      key: "counts.deliveredOrders",
      title: "Delivered Orders",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.activeOrders",
      title: "Active Orders",
      icon: "Truck",
      color: "bg-indigo-500",
    },
    {
      key: "counts.cancelledOrders",
      title: "Cancelled Orders",
      icon: "XCircle",
      color: "bg-red-500",
    },
  ],

  tableColumns: [
    {
      key: "orderNumber",
      label: "Order No.",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "shippingAddress",
      label: "Customer",
      sortable: true,
      visible: true,
      render: (v: any) => v.fullName || "Unknown",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      sortable: true,
      visible: true,
      render: (v: number) => (v ? `₹${v.toFixed(2)}` : "₹0.00"),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      sortable: true,
      visible: true,
      render: (v: PaymentStatus) => {
        const colorMap = {
          PAID: "text-green-600 bg-green-50",
          PENDING: "text-yellow-600 bg-yellow-50",
          FAILED: "text-red-600 bg-red-50",
          REFUNDED: "text-blue-600 bg-blue-50",
          AUTHORIZED: "bg-purple-100 text-purple-800",
        };
        return (
          <span className={`${colorMap[v] || ""} px-2 py-1 rounded`}>
            {v || "—"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Order Status",
      sortable: true,
      visible: true,
      render: (v: OrderStatus) => {
        const colorMap: Partial<Record<any, string>> = {
          PENDING: "text-yellow-600 bg-yellow-50",
          PROCESSING: "text-blue-600 bg-blue-50",
          SHIPPED: "text-indigo-600 bg-indigo-50",
          DELIVERED: "text-green-600 bg-green-50",
          CANCELLED: "text-red-600 bg-red-50",
          REFUNDED: "text-purple-600 bg-purple-50",
          FAILED: "text-red-500",
          CONFIRMED: "text-blue-500",
          OUT_FOR_DELIVERY: "text-brown-300",
        };
        return (
          <span className={`${colorMap[v] || ""} px-2 py-1 rounded`}>
            {v || "—"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Placed On",
      sortable: true,
      visible: true,
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row: OrderType, handlers?) => (
        <div className="flex gap-2">
          {handlers?.onView && (
            <button
              onClick={() => handlers.onView!(row)}
              className="p-1 cursor-pointer text-gray-600 hover:text-gray-800"
              title="View Order"
            >
              <Eye size={16} />
            </button>
          )}
          {handlers?.onApprove && (row.status === "CONFIRMED" || row.status === "PENDING") && (
            <div>
              <button
                onClick={() => handlers.onApprove!(row)}
                className="p-1 bg-green-200 border border-green-500 text-black rounded-md cursor-pointer"
              >
                Assign
              </button>
            </div>
          )}
        </div>
      ),
    },
  ],
};
