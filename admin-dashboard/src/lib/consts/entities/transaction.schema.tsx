import { FilterSchema } from "@/lib/types";
import {
  Eye,
  Receipt,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

export const transactionEntitySchema: FilterSchema = {
  sections: ["Basic", "Wallet", "Date Range"],

  fields: [
    {
      key: "type",
      label: "Transaction Type",
      type: "select",
      options: [
        { label: "Credit", value: "CREDIT" },
        { label: "Debit", value: "DEBIT" },
      ],
      section: "Basic",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Success", value: "SUCCESS" },
        { label: "Failed", value: "FAILED" },
      ],
      section: "Basic",
    },
    {
      key: "source",
      label: "Source",
      type: "text",
      section: "Basic",
    },
    {
      key: "walletId",
      label: "Wallet ID",
      type: "text",
      section: "Wallet",
    },
  ],

  defaultFilters: {
    search: "",
    type: undefined,
    status: undefined,
    source: undefined,
    walletId: undefined,
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
      key: "counts.totalTransactions",
      title: "Total Transactions",
      icon: "Receipt",
      color: "bg-blue-500",
    },
    {
      key: "counts.totalCredits",
      title: "Total Credits",
      icon: "ArrowDownCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.totalDebits",
      title: "Total Debits",
      icon: "ArrowUpCircle",
      color: "bg-red-500",
    },
    {
      key: "counts.totalVolume",
      title: "Total Volume",
      icon: "DollarSign",
      color: "bg-amber-500",
    },
  ],

  tableColumns: [
    {
      key: "type",
      label: "Type",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            v === "CREDIT"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      visible: true,
      sortable: true,
      render: (v: number) => (
        <span className="font-semibold text-gray-800">₹{v?.toFixed(2)}</span>
      ),
    },
    {
      key: "source",
      label: "Source",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span className="text-gray-700 text-sm">{v || "N/A"}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      visible: true,
      render: (v: string) => (
        <span className="text-gray-600 text-sm">{v || "—"}</span>
      ),
    },
    {
      key: "walletId",
      label: "Wallet Owner",
      visible: true,
      render: (walletId: any) => (
        <span className="text-gray-700 text-sm">
          {typeof walletId === "object"
            ? walletId?.ownerId || "N/A"
            : walletId || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      visible: true,
      sortable: true,
      render: (v: string) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            v === "SUCCESS"
              ? "bg-green-50 text-green-700"
              : v === "PENDING"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "balanceAfter",
      label: "Balance After",
      visible: true,
      render: (v: number) => (
        <span className="text-gray-700 font-medium">₹{v?.toFixed(2)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      visible: true,
      sortable: true,
      render: (date: string) => (
        <span className="text-gray-600 text-sm">
          {new Date(date).toLocaleString()}
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
              title="View Transaction"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      ),
    },
  ],
};
