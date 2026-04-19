"use client";

import React, { useState } from "react";
import { User, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  PageHeader,
  SearchBar,
  StatsCards,
  Table,
  FilterDropdown,
  FilterSheet,
  Pagination,
  Button,
} from "@/components";
import { useFilter, usePagination, useTable } from "@/hooks";
import { ROUTES, entitySchema } from "@/lib/consts";
import { BreadcrumbItem } from "@/lib/types";
import { useAllUsers } from "@/hooks/entities/useAdminUser";

export default function AdminUsersPage() {
  const router = useRouter();

  const { filters, activeFilters, setFilter, resetFilters } = useFilter("user");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data, isLoading, refetch } =
    useAllUsers(activeFilters);

  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);

  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.user.tableColumns, filters, setFilter);

  const handleView = (user: any) => {
    router.push(`/users/${user._id}`);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Users", icon: User },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="User Management"
        subtitle="View and manage all registered users"
      />

      <div className="p-6">
        {/* <StatsCards stats={stats} entity="user" /> */}

        {/* 🔍 Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search users by name, email, or phone..."
              />
            </div>

            <div className="flex items-center justify-end gap-4 mb-4">
              <Button onClick={() => setIsFilterOpen(true)}>
                Open Filters
              </Button>

              <FilterSheet
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                schema={entitySchema.user}
              />

              <FilterDropdown
                label="Columns"
                options={columnOptions}
                value={Array.from(visibleColumns).map(String)}
                onChange={handleColumnChange}
                multiple
              />
            </div>
          </div>
        </div>

        <Table
          data={(data as any).users || []}
          columns={entitySchema.user.tableColumns}
          visibleColumns={visibleColumns}
          sortField={filters.sortBy}
          sortDirection={filters.sortOrder}
          onView={handleView}
          toggleSort={toggleSort}
        />

        {(!data || (data as any).users.length === 0) && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}

        {/* <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        /> */}
      </div>
    </div>
   
  );
}
