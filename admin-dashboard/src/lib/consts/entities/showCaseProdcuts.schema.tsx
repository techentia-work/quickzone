import { FilterSchema } from "@/lib/types";
import React from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { ShowcaseProductType } from "@/lib/types/showCaseProduct/showCaseProduct.types";

export const showcaseProductEntitySchema: FilterSchema<any> = {
  sections: ["Basic", "Display", "Mapping", "Date Range"],

  // ===============================
  // FILTER FIELDS
  // ===============================
  fields: [
    {
      key: "search",
      label: "Search",
      type: "text",
      section: "Basic",
      placeholder: "Search showcase by type...",
    },
    {
      key: "isActive",
      label: "Active Only",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "isDeleted",
      label: "Include Deleted",
      type: "boolean",
      section: "Basic",
    },
  ],

  // ===============================
  // ✅ REQUIRED: STATS CARDS (FIX)
  // ===============================
  statsCards: [
    {
      key: "counts.total",
      title: "Total Showcases",
      icon: "LayoutGrid",
      color: "bg-blue-500",
    },
    {
      key: "counts.active",
      title: "Active Showcases",
      icon: "CheckCircle",
      color: "bg-green-500",
    },
    {
      key: "counts.inactive",
      title: "Inactive Showcases",
      icon: "XCircle",
      color: "bg-red-500",
    },
  ],

  // ===============================
  // DEFAULT FILTERS
  // ===============================
  defaultFilters: {
    search: "",
    isActive: undefined,
    isDeleted: undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  // ===============================
  // TABLE COLUMNS
  // ===============================
 tableColumns: [
  // ===============================
  // SUB CATEGORIES (MULTIPLE)
  // ===============================
  {
    key: "subCategories",
    label: "Sub Categories",
    visible: true,
    render: (_: any, row: any) => {
      if (!row.subCategories || row.subCategories.length === 0) {
        return (
          <span className="italic text-gray-400">
            No Subcategory
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1 max-w-[200px]">
          {row.subCategories.map((cat: any) => (
            <span
              key={cat._id}
              className="text-sm truncate"
            >
              • {cat.name}
            </span>
          ))}
        </div>
      );
    },
  },

  // ===============================
  // PRODUCTS (OLD + NEW SUPPORT)
  // ===============================
  {
    key: "products",
    label: "Products",
    visible: true,
    render: (_: any, row: any) => {
      const products =
        row.products?.length
          ? row.products
          : row.product
          ? [row.product]
          : [];

      if (!products.length) {
        return (
          <span className="italic text-gray-400">
            No Product
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1 max-w-[220px]">
          {products.map((p: any) => (
            <span
              key={p._id}
              className="text-sm truncate"
            >
              • {p.name}
            </span>
          ))}
        </div>
      );
    },
  },

  // ===============================
  // SHOWCASE TYPE
  // ===============================
  {
    key: "showcaseType",
    label: "Showcase Type",
    visible: true,
    render: (value: string) => (
      <span className="font-medium">
        {value?.replaceAll("_", " ")}
      </span>
    ),
  },

  // ===============================
  // STATUS
  // ===============================
  {
    key: "isActive",
    label: "Status",
    visible: true,
    render: (v: boolean) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          v
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {v ? "Active" : "Inactive"}
      </span>
    ),
  },

  // ===============================
  // CREATED AT
  // ===============================
  {
    key: "createdAt",
    label: "Created At",
    visible: true,
    render: (d: string) =>
      new Date(d).toLocaleString(),
  },

  // ===============================
  // ACTIONS (EDIT + DELETE)
  // ===============================
  {
    key: "actions",
    label: "Actions",
    visible: true,
    render: (_: any, row: ShowcaseProductType, handlers?: any) => (
      <div className="flex gap-2">
        {handlers?.onEdit && (
          <button
            onClick={() => handlers.onEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
        )}
        {handlers?.onDelete && (
          <button
            onClick={() => handlers.onDelete(row)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    ),
  },
],

};
