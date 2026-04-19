import { FilterSchema, CategoryType, TypeOfCategory, CategoryBasic } from "@/lib/types";
import React from "react";
import Image from "next/image";
import { Edit, Eye, Trash2, FolderTree } from "lucide-react";

export const categoryEntitySchema: FilterSchema = {
    sections: ['Basic', 'Hierarchy', 'SEO', 'Configuration', 'Date Range'],
    fields: [
        // ===== BASIC SECTION =====
        {
            key: 'type',
            label: 'Category Type',
            type: 'select',
            section: 'Basic',
            options: [
                { value: '', label: 'All Types' },
                { value: 'MASTER', label: 'Master' },
                { value: 'SUPER', label: 'Super' },
                { value: 'CATEGORY', label: 'Category' },
                { value: 'SUBCATEGORY', label: 'Subcategory' },
            ],
            defaultValue: '',
        },
        {
            key: 'isActive',
            label: 'Active Only',
            type: 'boolean',
            section: 'Basic',
        },
        {
            key: 'isDeleted',
            label: 'Include Deleted',
            type: 'boolean',
            section: 'Basic',
        },

        // ===== HIERARCHY SECTION =====
        {
            key: 'parentId',
            label: 'Parent Category',
            type: 'text',
            section: 'Hierarchy',
            placeholder: 'Parent Category ID',
        },
        {
            key: 'level',
            label: 'Category Level',
            type: 'range',
            section: 'Hierarchy',
            rangeConfig: { min: 0, max: 10, step: 1 },
        },
        {
            key: 'order',
            label: 'Display Order',
            type: 'range',
            section: 'Hierarchy',
            rangeConfig: { min: 0, max: 1000, step: 1 },
        },
        {
            key: 'hasChildren',
            label: 'Has Subcategories',
            type: 'boolean',
            section: 'Hierarchy',
        },

        // ===== SEO SECTION =====
        {
            key: 'hasMetaTitle',
            label: 'Has Meta Title',
            type: 'boolean',
            section: 'SEO',
        },
        {
            key: 'hasMetaDescription',
            label: 'Has Meta Description',
            type: 'boolean',
            section: 'SEO',
        },
        {
            key: 'hasMetaKeywords',
            label: 'Has Meta Keywords',
            type: 'boolean',
            section: 'SEO',
        },

        // ===== CONFIGURATION SECTION =====
        {
            key: 'hasThumbnail',
            label: 'Has Thumbnail',
            type: 'boolean',
            section: 'Configuration',
        },
        {
            key: 'hasSubtitle',
            label: 'Has Subtitle',
            type: 'boolean',
            section: 'Configuration',
        },
        {
            key: 'hasMarkup',
            label: 'Has Markup/Description',
            type: 'boolean',
            section: 'Configuration',
        },

        // ===== DATE RANGE SECTION =====
        {
            key: 'dateRange',
            label: 'Quick Date Range',
            type: 'select',
            section: 'Date Range',
            options: [
                { value: '', label: 'All Time' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '3m', label: 'Last 3 Months' },
                { value: '6m', label: 'Last 6 Months' },
                { value: '1y', label: 'Last Year' },
                { value: 'custom', label: 'Custom Range' },
            ],
            defaultValue: '',
        },
        {
            key: 'dateFrom',
            label: 'From Date',
            type: 'date',
            section: 'Date Range',
        },
        {
            key: 'dateTo',
            label: 'To Date',
            type: 'date',
            section: 'Date Range',
        },
    ],
    defaultFilters: {
        search: '',
        type: '',
        isActive: undefined,
        isDeleted: undefined,
        parentId: '',
        level: { gte: undefined, lte: undefined },
        order: { gte: undefined, lte: undefined },
        hasChildren: undefined,
        hasMetaTitle: undefined,
        hasMetaDescription: undefined,
        hasMetaKeywords: undefined,
        hasThumbnail: undefined,
        hasSubtitle: undefined,
        hasMarkup: undefined,
        dateRange: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
        limit: 10,
        sortBy: 'level',
        sortOrder: 'asc',
    },
    statsCards: [
        {
            key: 'counts.totalCategories',
            title: 'Total Categories',
            icon: 'FolderTree',
            color: 'bg-blue-500'
        },
        {
            key: 'counts.activeCategories',
            title: 'Active Categories',
            icon: 'CheckCircle',
            color: 'bg-green-500'
        },
        {
            key: 'counts.masterCategories',
            title: 'Master Categories',
            icon: 'Layers',
            color: 'bg-purple-500'
        },
        {
            key: 'counts.deletedCategories',
            title: 'Deleted Categories',
            icon: 'Trash2',
            color: 'bg-red-500'
        },
    ],
    tableColumns: [
        {
            key: "thumbnail",
            label: "Image",
            visible: true,
            render: (thumbnail: string) =>
                thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt="Category"
                        width={40}
                        height={40}
                        className="rounded object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        <FolderTree size={16} />
                    </div>
                ),
        },
        {
            key: "name",
            label: "Category Name",
            sortable: true,
            visible: true,
        },
        {
            key: "slug",
            label: "Slug",
            sortable: true,
            visible: true,
            render: (v: string) => v || "-",
        },
        {
            key: "type",
            label: "Type",
            sortable: true,
            visible: true,
            render: (v: TypeOfCategory) => {
                const typeColors = {
                    MASTER: "text-purple-600 bg-purple-50 px-2 py-1 rounded font-medium",
                    SUPER: "text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium",
                    CATEGORY: "text-green-600 bg-green-50 px-2 py-1 rounded font-medium",
                    SUBCATEGORY: "text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium",
                    LEVEL_5: "text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium",
                    LEVEL_6: "text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium",
                    LEVEL_7: "text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium",
                };
                return <span className={typeColors[v]}>{v}</span>;
            },
        },
        {
            key: "parent",
            label: "Parent Category",
            sortable: false,
            visible: true,
            render: (parent: CategoryBasic | null) => 
                parent?.name || <span className="text-gray-400 italic">Root</span>,
        },
        {
            key: "level",
            label: "Level",
            sortable: true,
            visible: true,
            render: (v: number) => v ?? 0,
        },
        {
            key: "order",
            label: "Order",
            sortable: true,
            visible: true,
        },
        {
            key: "fullSlug",
            label: "Full Slug",
            sortable: false,
            visible: false,
            render: (v: string) => v || "-",
        },
        {
            key: "subtitle",
            label: "Subtitle",
            visible: false,
            render: (v: string) => v || "-",
        },
        {
            key: "ancestors",
            label: "Ancestors",
            visible: false,
            render: (ancestors: CategoryBasic[]) => ancestors?.length || 0,
        },
        {
            key: "path",
            label: "Path",
            visible: false,
            render: (path: string[]) => path?.join(' > ') || "-",
        },
        {
            key: "isActive",
            label: "Active",
            sortable: true,
            visible: true,
            render: (v: boolean) => (
                <span className={v ? "text-green-600" : "text-gray-400"}>
                    {v ? "✓ Active" : "✗ Inactive"}
                </span>
            ),
        },
        {
            key: "metaTitle",
            label: "Meta Title",
            visible: false,
            render: (v: string) => v ? "✓" : "✗",
        },
        {
            key: "metaKeywords",
            label: "Meta Keywords",
            visible: false,
            render: (v: string) => v ? "✓" : "✗",
        },
        {
            key: "metaDescription",
            label: "Meta Description",
            visible: false,
            render: (v: string) => v ? "✓" : "✗",
        },
        {
            key: "markup",
            label: "Has Description",
            visible: false,
            render: (v: string) => v ? "✓ Yes" : "✗ No",
        },
        {
            key: "isDeleted",
            label: "Deleted",
            visible: false,
            render: (v: boolean) => (
                <span className={v ? "text-red-600" : "text-green-600"}>
                    {v ? "Yes" : "No"}
                </span>
            ),
        },
        {
            key: "deletedAt",
            label: "Deleted At",
            sortable: true,
            visible: false,
            render: (v: string | null) => v ? new Date(v).toLocaleDateString() : "-",
        },
        {
            key: "createdAt",
            label: "Created At",
            sortable: true,
            visible: false,
            render: (v: string) => new Date(v).toLocaleDateString(),
        },
        {
            key: "updatedAt",
            label: "Updated At",
            sortable: true,
            visible: false,
            render: (v: string) => new Date(v).toLocaleDateString(),
        },
        {
            key: "__v",
            label: "Version",
            visible: false,
        },
        {
            key: "actions",
            label: "Actions",
            visible: true,
            render: (_, row: CategoryType, handlers?) => (
                <div className="flex gap-2">
                    {handlers?.onView && (
                        <button
                            onClick={() => handlers.onView!(row)}
                            className="p-1 cursor-pointer text-gray-600 hover:text-gray-800"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                    {handlers?.onEdit && (
                        <button
                            onClick={() => handlers.onEdit!(row)}
                            className="p-1 cursor-pointer text-blue-600 hover:text-blue-800"
                            title="Edit Category"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {handlers?.onDelete && !row.isDeleted && (
                        <button
                            onClick={() => handlers.onDelete!(row)}
                            className="p-1 cursor-pointer text-red-600 hover:text-red-800"
                            title="Delete Category"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ],
};