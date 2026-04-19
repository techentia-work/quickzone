import { FilterSchema } from "@/lib/types";
import {
  Eye,
  Edit,
  Trash2,
  Wallet,
  CheckCircle,
  User,
  DollarSign,
} from "lucide-react";

export const walletEntitySchema: FilterSchema = {
  sections: ["Basic", "Owner", "Date Range"],

  fields: [
    {
      key: "isActive",
      label: "Active Only",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "ownerModel",
      label: "Owner Type",
      type: "select",
      options: [
        { label: "User", value: "User" },
        { label: "Vendor", value: "Vendor" },
        { label: "Driver", value: "Driver" },
      ],
      section: "Owner",
    },
    {
      key: "currency",
      label: "Currency",
      type: "text",
      section: "Basic",
    },
  ],

  defaultFilters: {
    search: "",
    ownerModel: undefined,
    isActive: undefined,
    currency: undefined,
    dateRange: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  statsCards: [
    {
      key: "counts.totalWallets",
      title: "Total Wallets",
      icon: "Wallet",
      color: "bg-blue-500",
    },
    {
      key: "counts.activeWallets",
      title: "Active Wallets",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.totalBalance",
      title: "Total Balance",
      icon: "DollarSign",
      color: "bg-amber-500",
    },
  ],

  tableColumns: [
    {
      key: "ownerModel",
      label: "Owner Type",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {v}
        </span>
      ),
    },
    {
      key: "ownerId",
      label: "Owner ID",
      visible: true,
      sortable: true,
      render: (id: string) => (
        <span className="text-gray-600 text-sm">{id}</span>
      ),
    },
    {
      key: "ownerName",
      label: "Owner Name",
      visible: true,
      render: (name: string) => (
        <span className="text-gray-800 font-medium">{name}</span>
      ),
    },
    {
      key: "balance",
      label: "Balance",
      visible: true,
      sortable: true,
      render: (v: number) => (
        <span className="text-green-700 font-medium">₹{v?.toFixed(2)}</span>
      ),
    },
    {
      key: "promoCash",
      label: "Promo Cash",
      visible: true,
      sortable: true,
      render: (v: number) => (
        <span className="text-amber-600 font-medium">₹{v?.toFixed(2)}</span>
      ),
    },
    {
      key: "promoCashExpiresAt",
      label: "Promo Expiry",
      visible: true,
      sortable: true,
      render: (date: string) =>
        date ? (
          <span className="text-gray-600 text-sm">
            {new Date(date).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
    {
      key: "currency",
      label: "Currency",
      visible: true,
    },
    {
      key: "isActive",
      label: "Status",
      visible: true,
      sortable: true,
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            v ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      visible: true,
      sortable: true,
      render: (date: string) => (
        <span className="text-gray-600 text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row, handlers?) => (
        <div className="flex gap-2">
          {/* {handlers?.onView && (
            <button
              onClick={() => handlers.onView!(row)}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <Eye size={16} />
            </button>
          )} */}
          {handlers?.onEdit && (
            <button
              onClick={() => handlers.onEdit!(row)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
            >
              <p>Add PromoCash</p>
            </button>
          )}
          {handlers?.onDelete && (
            <button
              onClick={() => handlers.onDelete!(row)}
              className="p-1 text-red-600 hover:text-red-900"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ],
};
