"use client";

import React, { useState } from "react";
import { Wallet, Home, PlusCircle, X } from "lucide-react";
import { BreadcrumbItem } from "@/lib/types";
import {
  Breadcrumb,
  FilterDropdown,
  FilterSheet,
  PageHeader,
  Pagination,
  SearchBar,
  Button,
  Table,
  Input,
  Label,
} from "@/components";
import { useFilter, usePagination, useTable } from "@/hooks";
import { entitySchema, ROUTES } from "@/lib/consts";
import useAdminWallet from "@/hooks/entities/useAdminWallet";
import { WalletType } from "@/lib/types/wallet/wallet.types";
import toast from "react-hot-toast";

export default function AdminWalletsPage() {
  const { filters, activeFilters, setFilter, resetFilters } =
    useFilter("wallet");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    wallets,
    pagination,
    isLoadingWallet,
    setWalletStatus,
    setSelectedWallet,
    adjustPromoCash,
  } = useAdminWallet(activeFilters);

  console.log("Pagination", pagination);

  const { handlePageChange, handleItemsPerPageChange } =
    usePagination(setFilter);
  const { visibleColumns, toggleSort, columnOptions, handleColumnChange } =
    useTable(entitySchema.wallet.tableColumns, filters, setFilter);

  const [selectedWallet, setPromoWallet] = useState<WalletType | null>(null);
  const [amount, setAmount] = useState("");
  const [validity, setValidity] = useState("");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN.ROOT, icon: Home },
    { label: "Wallets", icon: Wallet },
  ];

  const handlePromoCash = (wallet: WalletType) => {
    setPromoWallet(wallet);
  };

  const submitPromoCash = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    if (!validity || isNaN(Number(validity)) || Number(validity) <= 0) {
      return toast.error("Please enter a valid validity in days");
    }

    try {
      await adjustPromoCash(
        selectedWallet!._id,
        Number(amount),
        Number(validity)
      );
      toast.success(`₹${amount} PromoCash added (valid for ${validity} days)`);
      setPromoWallet(null);
      setAmount("");
      setValidity("");
    } catch {
      toast.error("Failed to add PromoCash");
    }
  };

  const handleDeactivate = async (wallet: WalletType) => {
    await setWalletStatus(wallet._id, !wallet.isActive);
  };

  if (isLoadingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 relative">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Wallet Management"
        subtitle="View, manage, and update user wallets"
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* ==== Filters and Table Header ==== */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <SearchBar
                value={filters.search}
                onChange={(value) => setFilter("search", value)}
                placeholder="Search wallets by user, ID, or status..."
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
                schema={entitySchema.wallet}
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

          {/* ==== Wallet Table ==== */}
          <Table
            data={wallets}
            columns={entitySchema.wallet.tableColumns}
            visibleColumns={visibleColumns}
            sortField={filters.sortBy}
            sortDirection={filters.sortOrder}
            toggleSort={toggleSort}
            onView={(wallet) => setSelectedWallet(wallet)}
            onDelete={handleDeactivate}
            onEdit={handlePromoCash}
          />

          {/* ==== Empty State ==== */}
          {wallets.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No wallets found
              </h3>
              <p className="text-gray-500">
                {filters.search
                  ? "Try adjusting your search or filters."
                  : "No wallets are currently available."}
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

      {/* ==== Custom Inline PromoCash Modal ==== */}
      {selectedWallet && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
            <button
              onClick={() => setPromoWallet(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add PromoCash to Wallet
            </h2>

            <div className="mb-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Wallet ID:</span>{" "}
                {selectedWallet._id}
              </p>
              <p>
                <span className="font-medium">Current Balance:</span> ₹
                {selectedWallet.balance}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Validity (in days)</Label>
                <Input
                  type="number"
                  value={validity}
                  onChange={(e) => setValidity(e.target.value)}
                  placeholder="Enter validity in days"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setPromoWallet(null)}>
                Cancel
              </Button>
              <Button onClick={submitPromoCash}>Add PromoCash</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
