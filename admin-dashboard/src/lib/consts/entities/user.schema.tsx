import { FilterSchema } from "@/lib/types";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Wallet,
  ShoppingBag,
  CheckCircle,
  XCircle,
  UserCircle,
  Calendar,
} from "lucide-react";

export const userEntitySchema: FilterSchema = {
  sections: ["Basic", "Status", "Date Range"],

  fields: [
    {
      key: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by name, email or phone",
      section: "Basic",
    },
    {
      key: "isActive",
      label: "Account Status",
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      section: "Status",
    },
    {
      key: "dateRange",
      label: "Created Date Range",
      type: "dateRange",
      section: "Date Range",
    },
  ],

  defaultFilters: {
    search: "",
    isActive: undefined,
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
      key: "counts.totalUsers",
      title: "Total Users",
      icon: "UserCircle",
      color: "bg-blue-500",
    },
    {
      key: "counts.activeUsers",
      title: "Active Users",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.inactiveUsers",
      title: "Inactive Users",
      icon: "XCircle",
      color: "bg-red-500",
    },
    {
      key: "counts.totalOrders",
      title: "Total Orders",
      icon: "ShoppingBag",
      color: "bg-amber-500",
    },
  ],

  tableColumns: [
    {
      key: "firstName",
      label: "First Name",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span className="font-medium text-gray-800">{v || "N/A"}</span>
      ),
    },
    {
      key: "lastName",
      label: "Last Name",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span className="font-medium text-gray-800">{v || "N/A"}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      visible: true,
      render: (v: string) => (
        <span className="text-gray-700 text-sm">{v || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      visible: true,
      render: (v: string) => (
        <span className="text-gray-700 text-sm">{v || "—"}</span>
      ),
    },
    {
      key: "metadata.emailVerified",
      label: "Email Verified",
      visible: true,
      render: (v: boolean) => (
        <span className="text-gray-700 text-sm">{v === true ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "metadata.phoneVerified",
      label: "Phone Verified",
      visible: true,
      sortable: true,
      render: (v: boolean) => (
        <span className="text-gray-700 text-sm">{v === true ? "Yes" : "No"}</span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      visible: true,
      sortable: true,
      render: (v: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            v ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined On",
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
          {handlers?.onView && (
            <button
              onClick={() => handlers.onView!(row)}
              className="p-1 text-gray-600 hover:text-gray-900 transition"
              title="View User"
            >
              <User size={16} />
            </button>
          )}
          {handlers?.onDelete && (
            <button
              onClick={() => handlers.onDelete!(row)}
              className="p-1 text-red-600 hover:text-red-800 transition"
              title="Delete User"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ],
};
