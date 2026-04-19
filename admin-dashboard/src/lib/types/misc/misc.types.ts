import React from "react";

/* =========================
   Breadcrumb
========================= */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/* =========================
   Filters
========================= */
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: "text" | "select" | "boolean" | "range" | "date" | "dateRange";
  options?: Array<{ value: string; label: string }>;
  rangeConfig?: {
    min: number;
    max: number;
    step: number;
    prefix?: string;
  };
  section: string;
  defaultValue?: any;
  placeholder?: string;
}

export type FilterParams = Record<string, any>;

/* =========================
   Table
========================= */
export interface ColumnConfig<T> {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  render?: (
    value: any,
    row: T,
    handlers?: {
      onView?: (row: T) => void;
      onEdit?: (row: T) => void;
      onDelete?: (row: T) => void;
      onApprove?: (row: T) => void;
      onReject?: (row: T) => void;
      onCancel?: (row: T) => void;
    }
  ) => React.ReactNode;
}

/* =========================
   Stats Cards
========================= */
export interface StatsCardConfig {
  key: string;
  title: string;
  icon: string;
  color: string;
  format?: (value: any) => string | React.ReactNode;
}

/* =========================
   Filter Schema
========================= */
export interface FilterSchema<T = any> {
  fields: FilterFieldConfig[];
  sections: string[];
  defaultFilters: Record<string, any>;
  statsCards: StatsCardConfig[];
  tableColumns: ColumnConfig<T>[];
}

/* =========================
   ✅ ENTITY TYPE (FINAL)
========================= */
export type EntityType =
  | "product"
  | "category"
  | "order"
  | "featured"
  | "featuredWeekBrand"   // ✅ FINAL & CORRECT
  |"shopByStore"
  |"brandOfTheDay"
  | "deliveryBoy"
  | "promo"
  | "banner"
  | "slider"
  | "wallet"
  | "transaction"
  | "user"
  | "brand"
  | "showcaseProduct";
