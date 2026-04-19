"use client";

import React, { useState } from "react";
import { Receipt, Home, Eye } from "lucide-react";
import {
  Breadcrumb,
  FilterDropdown,
  FilterSheet,
  PageHeader,
  Pagination,
  SearchBar,
  Button,
  Table,
} from "@/components";
import { useFilter, usePagination, useTable } from "@/hooks";
import { entitySchema, ROUTES } from "@/lib/consts";
import { BreadcrumbItem } from "@/lib/types";
import useAdminTransaction from "@/hooks/entities/useAdminTransaction";
import { TransactionTypeFrontend } from "@/lib/types/transaction/transaction.types";

export default function AdminTransactionsPage() {
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("transaction");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { transactions, pagination, isLoadingTransactions } =
    useAdminTransaction(activeFilters);

  console.log("Transactions", transactions);

  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.transaction.tableColumns, filters, setFilter);

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTypeFrontend | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Transactions", icon: Receipt },
  ];

  if (isLoadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 relative">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Transaction Management"
        subtitle="View, analyze, and manage user transactions"
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* ==== Filters and Table Header ==== */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search by user, type, or reference..."
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
                schema={entitySchema.transaction}
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

          {/* ==== Transactions Table ==== */}
          <Table
            data={transactions}
            columns={entitySchema.transaction.tableColumns}
            visibleColumns={visibleColumns}
            sortField={filters.sortBy}
            sortDirection={filters.sortOrder}
            toggleSort={toggleSort}
            onView={(transaction) => setSelectedTransaction(transaction)}
          />

          {/* ==== Empty State ==== */}
          {transactions.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500">
                {filters.search
                  ? "Try adjusting your search or filters."
                  : "No transactions are currently recorded."}
              </p>
            </div>
          )}

          {/* ==== Pagination ==== */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      {/* ==== Transaction Detail Modal ==== */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Transaction Details
            </h2>

            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <span className="font-medium">Transaction ID:</span>{" "}
                {selectedTransaction._id}
              </p>
              <p>
                <span className="font-medium">Type:</span>{" "}
                {selectedTransaction.type}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ₹
                {selectedTransaction.amount}
              </p>
              <p>
                <span className="font-medium">Source:</span>{" "}
                {selectedTransaction.source || "N/A"}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {selectedTransaction.description || "—"}
              </p>
              <p>
                <span className="font-medium">Balance After:</span> ₹
                {selectedTransaction.balanceAfter}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`font-semibold ${
                    selectedTransaction.status === "SUCCESS"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(selectedTransaction.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
