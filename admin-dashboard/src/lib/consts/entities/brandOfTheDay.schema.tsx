import { FilterSchema } from "@/lib/types";
import Image from "next/image";
import { Check, X, ExternalLink } from "lucide-react";

export const brandOfTheDayEntitySchema: FilterSchema = {
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
      placeholder: "Search by name or title",
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      section: "Basic",
    },
    {
      key: "masterCategory",
      label: "Master Category",
      type: "select",
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

    /* ---------- Name ---------- */
    {
      key: "name",
      label: "Name",
      sortable: true,
      visible: true,
    },

    /* ---------- Title ---------- */
    {
      key: "title",
      label: "Title",
      sortable: true,
      visible: true,
    },

    /* ---------- Website ---------- */
    {
      key: "websiteUrl",
      label: "Website",
      visible: true,
      render: (value) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        ),
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
