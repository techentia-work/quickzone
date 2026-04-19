import { FilterSchema, ProductEatableType, ProductStatus, ProductType, ProductVariantType, TaxRateType, } from "@/lib/types";
import React from "react";
import Image from "next/image";
import { Edit, Eye, Trash2 } from "lucide-react";

export const productEntitySchema: FilterSchema = {
    sections: ["Featured" ,'Basic', 'Category', 'Pricing', 'Inventory', 'Configuration', 'Date Range'],
    fields: [
        {
            key: 'featured',
            label: 'Featured',
            type: 'boolean',
            section: 'Featured',
        },
        // ===== BASIC SECTION =====
        {
            key: 'status',
            label: 'Product Status',
            type: 'select',
            section: 'Basic',
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'NOT_APPROVED', label: 'Not Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'PENDING', label: 'Pending' },
            ],
            defaultValue: 'all',
        },
        {
            key: 'brand',
            label: 'Brand',
            type: 'select',
            section: 'Basic',
            options: [
                { value: '', label: 'All Brands' },
                { value: 'Apple', label: 'Apple' },
                { value: 'Samsung', label: 'Samsung' },
                { value: 'OnePlus', label: 'OnePlus' },
                { value: 'Nike', label: 'Nike' },
                { value: 'Adidas', label: 'Adidas' },
                // Add more brands as needed
            ],
            defaultValue: '',
        },
        {
            key: 'productType',
            label: 'Product Type',
            type: 'select',
            section: 'Basic',
            options: [
                { value: '', label: 'All Types' },
                { value: 'VEG', label: '🌱 Vegetarian' },
                { value: 'NON_VEG', label: '🍖 Non-Vegetarian' },
                { value: 'NONE', label: 'Not Applicable' },
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
            key: 'isApproved',
            label: 'Approved Only',
            type: 'boolean',
            section: 'Basic',
        },
        {
            key: 'isDeleted',
            label: 'Include Deleted',
            type: 'boolean',
            section: 'Basic',
        },

        // ===== CATEGORY SECTION =====
        {
            key: 'categoryId',
            label: 'Category',
            type: 'text',
            section: 'Category',
            placeholder: 'Category ID',
        },
        {
            key: 'categoryId.type',
            label: 'Category Type',
            type: 'select',
            section: 'Category',
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
            key: 'sellerId',
            label: 'Seller ID',
            type: 'text',
            section: 'Category',
            placeholder: 'Filter by Seller ID',
        },

        // ===== PRICING SECTION =====
        {
            key: 'variants.price',
            label: 'Variant Price',
            type: 'range',
            section: 'Pricing',
            rangeConfig: { min: 0, max: 100000, step: 100, prefix: '₹' },
        },
        {
            key: 'variants.mrp',
            label: 'Variant MRP',
            type: 'range',
            section: 'Pricing',
            rangeConfig: { min: 0, max: 100000, step: 100, prefix: '₹' },
        },
        {
            key: 'variants.discountPercent',
            label: 'Discount Percent',
            type: 'range',
            section: 'Pricing',
            rangeConfig: { min: 0, max: 100, step: 5, prefix: '' },
        },
        {
            key: 'taxRate',
            label: 'Tax Rate',
            type: 'select',
            section: 'Pricing',
            options: [
                { value: '', label: 'All Tax Rates' },
                { value: 'gst_5', label: 'GST 5%' },
                { value: 'gst_12', label: 'GST 12%' },
                { value: 'gst_18', label: 'GST 18%' },
                { value: 'gst_28', label: 'GST 28%' },
                { value: 'gst_40', label: 'GST 40%' },
            ],
            defaultValue: '',
        },

        // ===== INVENTORY SECTION =====
        {
            key: 'variants.stock',
            label: 'Stock Quantity',
            type: 'range',
            section: 'Inventory',
            rangeConfig: { min: 0, max: 10000, step: 10 },
        },
        {
            key: 'variants.inventoryType',
            label: 'Inventory Type',
            type: 'select',
            section: 'Inventory',
            options: [
                { value: '', label: 'All Types' },
                { value: 'LIMITED', label: 'Limited' },
                { value: 'UNLIMITED', label: 'Unlimited' },
            ],
            defaultValue: '',
        },
        {
            key: 'variants.variantType',
            label: 'Variant Type',
            type: 'select',
            section: 'Inventory',
            options: [
                { value: '', label: 'All Types' },
                { value: 'packet', label: 'Packet' },
                { value: 'loose', label: 'Loose' },
            ],
            defaultValue: '',
        },
        {
            key: 'variants.status',
            label: 'Variant Status',
            type: 'select',
            section: 'Inventory',
            options: [
                { value: '', label: 'All Statuses' },
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'SOLD_OUT', label: 'Sold Out' },
            ],
            defaultValue: '',
        },

        // ===== CONFIGURATION SECTION =====
        {
            key: 'isReturnable',
            label: 'Returnable Only',
            type: 'boolean',
            section: 'Configuration',
        },
        {
            key: 'isCOD',
            label: 'COD Available',
            type: 'boolean',
            section: 'Configuration',
        },
        {
            key: 'isCancelable',
            label: 'Cancelable',
            type: 'boolean',
            section: 'Configuration',
        },
        {
            key: 'maxQtyPerUser',
            label: 'Max Qty Per User',
            type: 'range',
            section: 'Configuration',
            rangeConfig: { min: 1, max: 100, step: 1 },
        },
        {
            key: 'ratings.avg',
            label: 'Average Rating',
            type: 'range',
            section: 'Configuration',
            rangeConfig: { min: 0, max: 5, step: 0.5, prefix: '⭐' },
        },
        {
            key: 'popularity',
            label: 'Popularity Score',
            type: 'range',
            section: 'Configuration',
            rangeConfig: { min: 0, max: 1000, step: 10 },
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
        brand: '',
        productType: '',
        isActive: undefined,
        isApproved: undefined,
        isDeleted: undefined,
        categoryId: '',
        'categoryId.type': '',
        sellerId: '',
        'variants.price': { gte: undefined, lte: undefined },
        'variants.mrp': { gte: undefined, lte: undefined },
        'variants.discountPercent': { gte: undefined, lte: undefined },
        'variants.stock': { gte: undefined, lte: undefined },
        'variants.inventoryType': '',
        'variants.variantType': '',
        'variants.status': '',
        taxRate: '',
        isReturnable: undefined,
        isCOD: undefined,
        isCancelable: undefined,
        maxQtyPerUser: { gte: undefined, lte: undefined },
        'ratings.avg': { gte: undefined, lte: undefined },
        popularity: { gte: undefined, lte: undefined },
        dateRange: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    statsCards: [
        {
            key: 'counts.totalProducts',
            title: 'Total Products',
            icon: 'Package',
            color: 'bg-blue-500'
        },
        {
            key: 'counts.activeProducts',
            title: 'Active Products',
            icon: 'TrendingUp',
            color: 'bg-green-500'
        },
        {
            key: 'counts.approvedProducts',
            title: 'Approved Products',
            icon: 'CheckCircle',
            color: 'bg-purple-500'
        },
        {
            key: 'counts.totalVariants',
            title: 'Total Variants',
            icon: 'AlertTriangle',
            color: 'bg-orange-500'
        },
    ],
    tableColumns: [
        {
            key: "images",
            label: "Image",
            visible: true,
            render: (images: string[]) =>
                images?.[0] ? (
                    <Image
                        src={images[0]}
                        alt="Product"
                        width={40}
                        height={40}
                        className="rounded object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500" >
                        NoImg
                    </div>
                ),
        },
        {
            key: "name",
            label: "Product Name",
            sortable: true,
            visible: true
        },
        {
            key: "slug",
            label: "Slug",
            sortable: true,
            visible: false
        },
        {
            key: "brandId.name",
            label: "Brand",
            sortable: true,
            visible: true,
            render: (v: any, row: ProductType) => row.brandId?.name ?? "-",
        },
        {
            key: "categoryId.name",
            label: "Category",
            sortable: true,
            visible: true,
            render: (v: any, row: ProductType) => row.categoryId?.name ?? "-",
        },
        {
            key: "categoryId.type",
            label: "Category Type",
            sortable: false,
            visible: false,
            render: (v: any, row: ProductType) => row.categoryId?.type ?? "-",
        },
        {
            key: "productType",
            label: "Type",
            sortable: true,
            visible: true,
            render: (v: ProductEatableType) => {
                const typeMap = {
                    VEG: "🌱 Veg",
                    NON_VEG: "🍖 Non-Veg",
                    NONE: "N/A",
                };
                return typeMap[v] || v;
            },
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            visible: true,
            render: (v: ProductStatus) => {
                const statusColors = {
                    APPROVED: "text-green-600 bg-green-50 px-2 py-1 rounded",
                    NOT_APPROVED: "text-gray-600 bg-gray-50 px-2 py-1 rounded",
                    REJECTED: "text-red-600 bg-red-50 px-2 py-1 rounded",
                    PENDING: "text-yellow-600 bg-yellow-50 px-2 py-1 rounded",
                };
                return <span className={statusColors[v]}> {v} </span>;
            },
        },
        {
            key: "variants",
            label: "Variants",
            visible: true,
            render: (variants: ProductVariantType[]) => variants?.length || 0,
        },
        {
            key: "variants.price",
            label: "Price Range",
            visible: true,
            render: (v: any, row: ProductType) => {
                if (!row.variants?.length) return "-";
                const prices = row.variants.map(v => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
            },
        },
        {
            key: "variants.stock",
            label: "Total Stock",
            visible: true,
            render: (v: any, row: ProductType) => {
                if (!row.variants?.length) return "-";
                const totalStock = row.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
                return totalStock;
            },
        },
        {
            key: "ratings.avg",
            label: "Rating",
            sortable: true,
            visible: true,
            render: (v: any, row: ProductType) =>
                row.ratings?.avg
                    ? `⭐ ${row.ratings.avg.toFixed(1)} (${row.ratings.count})`
                    : "No ratings",
        },
        {
            key: "popularity",
            label: "Popularity",
            sortable: true,
            visible: false,
        },
        {
            key: "featured",
            label: "Featured",
            sortable: true,
            visible: false,
        },
        {
            key: "isActive",
            label: "Active",
            sortable: true,
            visible: true,
            render: (v: boolean) => (
                <span className={v ? "text-green-600" : "text-gray-400"} >
                    {v ? "✓ Yes" : "✗ No"}
                </span>
            ),
        },
        {
            key: "isApproved",
            label: "Approved",
            sortable: true,
            visible: false,
            render: (v: boolean) => (
                <span className={v ? "text-green-600" : "text-gray-400"} >
                    {v ? "✓" : "✗"}
                </span>
            ),
        },
        {
            key: "isReturnable",
            label: "Returnable",
            visible: false,
            render: (v: boolean) => (v ? "✓" : "✗"),
        },
        {
            key: "isCOD",
            label: "COD",
            visible: false,
            render: (v: boolean) => (v ? "✓" : "✗"),
        },
        {
            key: "isCancelable",
            label: "Cancelable",
            visible: false,
            render: (v: boolean) => (v ? "✓" : "✗"),
        },
        {
            key: "maxQtyPerUser",
            label: "Max Qty/User",
            visible: false,
        },
        {
            key: "taxRate",
            label: "Tax Rate",
            visible: false,
            render: (v: any) => v ? v.replace('gst_', 'GST ') + '%' : "-",
        },
        {
            key: "sellerId",
            label: "Seller ID",
            visible: false,
            render: (v: string | null) => v || "-",
        },
        {
            key: "tags",
            label: "Tags",
            visible: false,
            render: (tags: string[]) => tags?.length || 0,
        },
        {
            key: "isDeleted",
            label: "Deleted",
            visible: false,
            render: (v: boolean) => (v ? "Yes" : "No"),
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
            render: (_, row: ProductType, handlers?) => (
                <div className="flex gap-2" >
                    {handlers?.onView && (
                        <button
                            onClick={() => handlers.onView!(row)}
                            className="p-1 cursor-pointer text-gray-600 hover:text-gray-800"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                    )
                    }
                    {
                        handlers?.onEdit && (
                            <button
                                onClick={() => handlers.onEdit!(row)}
                                className="p-1 cursor-pointer text-blue-600 hover:text-blue-800"
                                title="Edit Product"
                            >
                                <Edit size={16} />
                            </button>
                        )
                    }
                    {
                        handlers?.onDelete && !row.isDeleted && (
                            <button
                                onClick={() => handlers.onDelete!(row)}
                                className="p-1 cursor-pointer text-red-600 hover:text-red-800"
                                title="Delete Product"
                            >
                                <Trash2 size={16} />
                            </button>
                        )
                    }
                </div>
            ),
        },
    ],
}