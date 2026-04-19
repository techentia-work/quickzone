import Image from "next/image";
import { Eye, Edit, Trash2, Star, CheckCircle, Link2 } from "lucide-react";
import { FilterSchema } from "@/lib/types";

export const featuredEntitySchema: FilterSchema = {
  sections: ["Basic", "MapType", "Position", "Category", "Date Range"],

  fields: [
    {
      key: "search",
      label: "Search Title or Slug",
      section: "Basic",
      type: "text",
      placeholder: "Search by title or slug...",
    },
    {
      key: "isActive",
      label: "Active Only",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "mapType",
      label: "Map Type",
      type: "select",
      section: "MapType",
      options: [
        { value: "", label: "All Map Types" },
        { value: "SUBCATEGORY", label: "SUBCATEGORY" },
        { value: "PRODUCT", label: "PRODUCT" },
      ],
      defaultValue: "",
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
    {
      key: "category",
      label: "Category",
      type: "select",
      section: "Category",
      placeholder: "Select category",
    },
    {
      key: "dateRange",
      label: "Created Between",
      type: "dateRange",
      section: "Date Range",
    },
  ],

  defaultFilters: {
    search: "",
    isActive: undefined,
    category: "",
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
      key: "counts.totalFeatured",
      title: "Total Featured",
      icon: "Star",
      color: "bg-blue-500",
    },
    {
      key: "counts.activeFeatured",
      title: "Active Featured",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.deletedFeatured",
      title: "Deleted Featured",
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
              alt="Featured"
              width={60}
              height={60}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              <Star size={18} />
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
      render: (v: string) => (
        <span className="text-gray-700 text-sm break-all">{v || "-"}</span>
      ),
    },
    {
      key: "order",
      label: "Order",
      sortable: true,
      visible: true,
      render: (v: number) => (
        <span className="font-medium text-gray-800">{v ?? "-"}</span>
      ),
    },
    {
      key: "position",
      label: "Position",
      sortable: true,
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
      key: "color",
      label: "Color",
      visible: true,
      sortable: false,
      render: (color: string) =>
        color ? (
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color }}
            ></span>
            <span className="text-gray-700 text-sm">{color}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: "mappings",
      label: "Mapped Items",
      visible: true,
      render: (mappings: any[]) =>
        mappings && mappings.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {mappings.map((map) => (
              <span
                key={map.refId}
                className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded text-xs flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                {map.data?.name || "—"}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
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
      key: "createdAt",
      label: "Created At",
      sortable: true,
      visible: true,
      render: (v: string) => new Date(v).toLocaleDateString(),
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
