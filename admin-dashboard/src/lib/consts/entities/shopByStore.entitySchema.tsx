import { FilterSchema } from "@/lib/types";
import Image from "next/image";
import { Check, X } from "lucide-react";

export const shopByStoreEntitySchema: FilterSchema = {
  /* ================= Sections ================= */
  sections: ["Basic"],

  /* ================= Default Filters ================= */
  defaultFilters: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  /* ================= Filter Fields ================= */
  fields: [
    {
      key: "search",
      label: "Search",
      type: "text",
      section: "Basic",
      placeholder: "Search by store name",
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      section: "Basic",
    },
  ],

  statsCards: [],

  /* ================= Table Columns ================= */
  tableColumns: [
    /* ---------- Thumbnail ---------- */
    {
      key: "thumbnail",
      label: "Thumbnail",
      visible: true,
      render: (value) =>
        value ? (
          <Image
            src={value}
            alt="thumbnail"
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },

    /* ---------- Banner ---------- */
    {
      key: "banner",
      label: "Banner",
      visible: true,
      render: (value) =>
        value ? (
          <Image
            src={value}
            alt="banner"
            width={80}
            height={40}
            className="rounded-md object-cover"
          />
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },

    /* ---------- Store Name ---------- */
    {
      key: "name",
      label: "Store Name",
      sortable: true,
      visible: true,
    },

    /* ---------- Slug ---------- */
    {
      key: "slug",
      label: "Slug",
      visible: true,
    },

    /* ---------- Master Category ---------- */
    {
      key: "masterCategory",
      label: "Master Category",
      visible: true,
      render: (value) =>
        value?.name ? (
          <span className="font-medium">{value.name}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },

    /* ---------- Active ---------- */
    {
      key: "isActive",
      label: "Active",
      visible: true,
      render: (value) =>
        value ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-red-500" />
        ),
    },

    /* ---------- Created At ---------- */
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      visible: true,
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },

    /* ---------- Actions ---------- */
    {
      key: "actions",
      label: "Actions",
      visible: true,
      render: (_, row, handlers) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlers?.onEdit?.(row)}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handlers?.onDelete?.(row)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ],
};
