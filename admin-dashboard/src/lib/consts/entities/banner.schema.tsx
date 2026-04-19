import Image from "next/image";
import { Eye, Edit, Trash2, ImageIcon, CheckCircle } from "lucide-react";
import { FilterSchema } from "@/lib/types";

export const bannerEntitySchema: FilterSchema = {
  sections: ["Basic", "Position", "Configuration", "Date Range"],

  fields: [
    {
      key: "isActive",
      label: "Active Only",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "position",
      label: "TOP",
      type: "select",
      section: "Position",
      options: [
        { value: "", label: "All Position" },
        { value: "TOP", label: "TOP" },
        { value: "MIDDLE", label: "MIDDLE" },
        { value: "BOTTOM", label: "BOTTOM" },
        { value: "APP", label: "APP" },
      ],
      defaultValue: "",
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
    sortBy: "order",
    sortOrder: "asc",
  },

  statsCards: [
    {
      key: "counts.totalBanners",
      title: "Total Banners",
      icon: "ImageIcon",
      color: "bg-blue-500",
    },
    {
      key: "counts.activeBanners",
      title: "Active Banners",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.deletedBanners",
      title: "Deleted Banners",
      icon: "Trash2",
      color: "bg-red-500",
    },
  ],

  tableColumns: [
    {
      key: "imageUrl",
      label: "Image",
      visible: true,
      render: (imageUrl: string) => (
        <div className="flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Banner"
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
      key: "title",
      label: "Title",
      sortable: true,
      visible: true,
    },
    {
      key: "slug",
      label: "Slug",
      visible: true,
    },
    {
      key: "category",
      label: "Category",
      visible: true,
      render: (cat: any) =>
        cat ? (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {cat.name}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "subcategory",
      label: "Subcategory",
      visible: true,
      render: (subcat: any) =>
        subcat ? (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {subcat.name}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      visible: true,
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
      key: "order",
      label: "Order",
      sortable: true,
      visible: true,
    },
    {
      key: "position",
      label: "Position",
      sortable: true,
      visible: true,
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
