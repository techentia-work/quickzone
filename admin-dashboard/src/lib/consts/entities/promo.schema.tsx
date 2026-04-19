import { FilterSchema } from "@/lib/types";
import { DiscountType } from "@/lib/types/promocode/promocode.enums";
import { PromoType } from "@/lib/types/promocode/promocode.types";
import { Eye, PencilIcon, Power, Trash2 } from "lucide-react";
import React from "react";

export const promoEntitySchema: FilterSchema = {
  sections: ["Basic", "Discount", "Usage", "Date Range"],

  fields: [
    // === BASIC SECTION ===
    {
      key: "status",
      label: "Promo Status",
      type: "select",
      section: "Basic",
      options: [
        { value: "ALL", label: "All" },
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
        { value: "EXPIRED", label: "Expired" },
      ],
      defaultValue: "all",
    },
    {
      key: "code",
      label: "Promo Code",
      type: "text",
      section: "Basic",
      placeholder: "Search by promo code",
    },
    {
      key: "title",
      label: "Promo Title",
      type: "text",
      section: "Basic",
      placeholder: "Search by title",
    },

    // === DISCOUNT SECTION ===
    {
      key: "discountType",
      label: "Discount Type",
      type: "select",
      section: "Discount",
      options: [
        { value: "", label: "All" },
        { value: "PERCENTAGE", label: "Percentage" },
        { value: "FLAT", label: "Flat" },
      ],
      defaultValue: "",
    },
    {
      key: "discountValue",
      label: "Discount Value",
      type: "range",
      section: "Discount",
      rangeConfig: { min: 0, max: 10000, step: 10, prefix: "₹" },
    },
    {
      key: "minimumOrderAmount",
      label: "Minimum Order Value",
      type: "range",
      section: "Discount",
      rangeConfig: { min: 0, max: 50000, step: 100, prefix: "₹" },
    },

    // === USAGE SECTION ===
    {
      key: "usageLimit",
      label: "Usage Limit",
      type: "range",
      section: "Usage",
      rangeConfig: { min: 0, max: 1000, step: 1 },
    },
    {
      key: "usedCount",
      label: "Times Used",
      type: "range",
      section: "Usage",
      rangeConfig: { min: 0, max: 1000, step: 1 },
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
      key: "startDate",
      label: "Start Date",
      type: "date",
      section: "Date Range",
    },
    { key: "endDate", label: "End Date", type: "date", section: "Date Range" },
  ],

  defaultFilters: {
    search: "",
    status: "all",
    code: "",
    title: "",
    discountType: "",
    discountValue: { gte: undefined, lte: undefined },
    minimumOrderAmount: { gte: undefined, lte: undefined },
    usageLimit: { gte: undefined, lte: undefined },
    usedCount: { gte: undefined, lte: undefined },
    dateRange: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  statsCards: [
    {
      key: "totalPromos",
      title: "Total Promos",
      icon: "Gift",
      color: "bg-blue-500",
    },
    {
      key: "activePromos",
      title: "Active Promos",
      icon: "Power",
      color: "bg-green-500",
    },
    {
      key: "expiredPromos",
      title: "Expired Promos",
      icon: "Clock",
      color: "bg-yellow-500",
    },
    {
      key: "avgUsagePerPromo",
      title: "Avg. Usage Per Promo",
      icon: "XCircle",
      color: "bg-red-500",
    },
  ],

  tableColumns: [
    {
      key: "code",
      label: "Promo Code",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "description",
      label: "Title",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "discountType",
      label: "Type",
      sortable: true,
      visible: true,
      render: (v: DiscountType) =>
        v == "PERCENTAGE" ? "Percentage" : v === "FLAT" ? "Flat" : "—",
    },
    {
      key: "discountValue",
      label: "Discount",
      sortable: true,
      visible: true,
      render: (v: number, row: PromoType) =>
        row.discountType === "PERCENTAGE" ? `${v}%` : `₹${v}`,
    },
    {
      key: "minCartValue",
      label: "Min Order",
      sortable: true,
      visible: true,
      render: (v: number) => (v ? `₹${v}` : "—"),
    },
    {
      key: "usageLimit",
      label: "Usage Limit",
      sortable: true,
      visible: true,
      render: (v: number) => v ?? "∞",
    },
    {
      key: "usedCount",
      label: "Used",
      sortable: true,
      visible: true,
      render: (v: number) => v || 0,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      visible: true,
      render: (v: "ACTIVE" | "INACTIVE" | "EXPIRED") => {
        const colorMap = {
          ACTIVE: "text-green-600 bg-green-50",
          INACTIVE: "text-gray-600 bg-gray-50",
          EXPIRED: "text-red-600 bg-red-50",
        };
        return (
          <span className={`${colorMap[v] || ""} px-2 py-1 rounded`}>
            {v || "—"}
          </span>
        );
      },
    },
    {
      key: "endDate",
      label: "Expires On",
      sortable: true,
      visible: true,
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row: PromoType, handlers?) => (
        <div className="flex gap-2">
          {handlers?.onDelete && (
            <button
              onClick={() => handlers.onDelete!(row)}
              className="p-1 cursor-pointer text-red-600 hover:text-red-700"
              title="Delete Promo"
            >
              <Trash2 size={16} />
            </button>
          )}
          {handlers?.onEdit && (
            <button
              onClick={() => handlers.onEdit!(row)}
              className="p-1 cursor-pointer text-blue-600 hover:text-blue-700"
              title="Edit Promo"
            >
              <PencilIcon size={16} />
            </button>
          )}
        </div>
      ),
    },
  ],
};
