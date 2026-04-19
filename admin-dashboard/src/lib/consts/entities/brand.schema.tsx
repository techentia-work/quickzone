"use client";

import Image from "next/image";
import { Tag, ImageIcon, Edit, Trash2, CheckCircle } from "lucide-react";
import { FilterSchema } from "@/lib/types";

export const brandEntitySchema: FilterSchema = {
  sections: ["Basic", "Date Range"],

  fields: [
    {
      key: "isActive",
      label: "Active Only",
      type: "boolean",
      section: "Basic",
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
    sortBy: "name",
    sortOrder: "asc",
  },

  statsCards: [
    {
      key: "counts.totalBrands",
      title: "Total Brands",
      icon: "Tag",
      color: "bg-blue-500",
    },
    {
      key: "counts.activeBrands",
      title: "Active Brands",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.deletedBrands",
      title: "Deleted Brands",
      icon: "Trash2",
      color: "bg-red-500",
    },
  ],

  tableColumns: [
    {
      key: "thumbnail",
      label: "Thumbnail",
      visible: true,
      render: (url: string) => (
        <div className="flex items-center justify-center">
          {url ? (
            <Image
              src={url}
              alt="Brand Thumbnail"
              width={60}
              height={60}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              <ImageIcon size={18} />
            </div>
          )}
        </div>
      ),
    },

    {
      key: "name",
      label: "Brand Name",
      sortable: true,
      visible: true,
    },

    {
      key: "slug",
      label: "Slug",
      visible: true,
    },

    {
      key: "isActive",
      label: "Status",
      sortable: true,
      visible: true,
      render: (active: boolean) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      key: "banner",
      label: "Banner",
      visible: true,
      render: (url: string | null) =>
        url ? (
          <Image
            src={url}
            alt="Brand Banner"
            width={100}
            height={50}
            className="rounded object-cover"
          />
        ) : (
          "-"
        ),
    },

    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row, handlers?) => (
        <div className="flex gap-2">
          {handlers?.onEdit && (
            <button
              onClick={() => handlers.onEdit!(row)}
              className="p-1 text-blue-600 hover:text-blue-900"
            >
              <Edit size={16} />
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
