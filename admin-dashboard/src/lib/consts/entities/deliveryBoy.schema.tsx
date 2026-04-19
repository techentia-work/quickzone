import { FilterSchema } from "@/lib/types";
import {
  Eye,
  UserCheck,
  UserX,
  Truck,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";
import React from "react";
import { DeliveryBoyStatus } from "@/lib/types/deliveryBoy/deliveryBoy.enum";

export const deliveryBoyEntitySchema: FilterSchema = {
  sections: ["Basic", "Status", "Activity", "Date Range"],

  fields: [
    // === BASIC SECTION ===
    {
      key: "search",
      label: "Search",
      type: "text",
      section: "Basic",
      placeholder: "Search by name, email, or phone...",
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      section: "Basic",
      placeholder: "Filter by email",
    },
    {
      key: "phone",
      label: "Phone",
      type: "text",
      section: "Basic",
      placeholder: "Filter by phone number",
    },

    // === STATUS SECTION ===
    {
      key: "status",
      label: "Status",
      type: "select",
      section: "Status",
      options: [
        { value: "", label: "All" },
        { value: DeliveryBoyStatus.AVAILABLE, label: "Available" },
        { value: DeliveryBoyStatus.ASSIGNED, label: "Assigned" },
        { value: DeliveryBoyStatus.OFFLINE, label: "Offline" },
      ],
      defaultValue: "",
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      section: "Status",
    },

    // === ACTIVITY SECTION ===
    {
      key: "assignedOrdersCount",
      label: "Assigned Orders",
      type: "range",
      section: "Activity",
      rangeConfig: { min: 0, max: 100, step: 1 },
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
    email: "",
    phone: "",
    status: "",
    isActive: undefined,
    assignedOrdersCount: { gte: undefined, lte: undefined },
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
      key: "counts.totalDeliveryBoys",
      title: "Total Delivery Boys",
      icon: "Truck",
      color: "bg-blue-500",
    },
    {
      key: "counts.available",
      title: "Available",
      icon: "UserCheck",
      color: "bg-green-500",
    },
    {
      key: "counts.assigned",
      title: "Assigned",
      icon: "UserX",
      color: "bg-yellow-500",
    },
    {
      key: "counts.offline",
      title: "Offline",
      icon: "UserX",
      color: "bg-red-500",
    },
  ],

  tableColumns: [
    {
      key: "name",
      label: "Name",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      visible: true,
      render: (v: string) => v || "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      visible: true,
      render: (v: DeliveryBoyStatus) => {
        const colorMap: Partial<Record<DeliveryBoyStatus, string>> = {
          AVAILABLE: "text-green-600 bg-green-50",
          ASSIGNED: "text-yellow-600 bg-yellow-50",
          OFFLINE: "text-red-600 bg-red-50",
        };
        return (
          <span className={`${colorMap[v] || ""} px-2 py-1 rounded`}>
            {v || "—"}
          </span>
        );
      },
    },
    {
      key: "assignedOrders",
      label: "Assigned Orders",
      sortable: false,
      visible: true,
      render: (v: string[]) => v?.length || 0,
    },
    {
      key: "lastLogin",
      label: "Last Login",
      sortable: true,
      visible: true,
      render: (v?: string) =>
        v ? new Date(v).toLocaleString() : "Never Logged In",
    },
    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row: DeliveryBoyType, handlers?) => (
        <div className="flex gap-2">
          {handlers?.onView && (
            <button
              onClick={() => handlers.onView!(row)}
              className="p-1 cursor-pointer text-blue-600 hover:text-blue-800"
              title="View Profile"
            >
              <Eye size={16} />
            </button>
          )}
          {handlers?.onDelete && (
            <button
              onClick={() => handlers.onDelete!(row)}
              className="p-1 cursor-pointer text-red-600 hover:text-red-800"
              title="Delete Delivery Boy"
            >
              <Trash2Icon size={16} />
            </button>
          )}
        </div>
      ),
    },
  ],
};
