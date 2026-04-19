"use client";

import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui";
import { Loader2, Wallet2, Plus, ArrowDown, ArrowUp, RefreshCw, Clock } from "lucide-react";
import { useWallet } from "@/hooks/entities/useWallet";
import { useAuth } from "@/hooks";
import { useTransaction } from "@/hooks/entities/useTransaction";
import toast from "react-hot-toast";

export default function WalletPage() {
  const { wallet, isLoading, createWallet, isCreating } = useWallet();
  const { user } = useAuth();

  const {
    transactions,
    summary,
    isLoading: isTxnLoading,
    refetchTransactions,
  } = useTransaction(wallet?._id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-green-600" />
          <p className="text-gray-600 font-medium">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const handleAddBalance = () => {
    toast("This feature will be available soon!", {
      icon: "🚀",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
        padding: "16px",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                  <Wallet2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                    My Wallet
                  </CardTitle>
                  <p className="text-green-50 mt-1 text-base">
                    Manage your balance and transactions
                  </p>
                </div>
              </div>

            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            {wallet ? (
              <>
                <div className="space-y-6 mb-8">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg">
                      {/* Title */}
                      <h3 className="text-lg font-semibold mb-3">Available Balance </h3>

                      {/* Combined Amount */}
                      <div className="text-4xl font-bold">
                        ₹{(wallet.balance + wallet.promoCash)}
                      </div>

                      {/* Breakdown */}
                      <div className="mt-4 bg-white/10 p-3 rounded-xl text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Promocash</span>
                          <span>₹{wallet.promoCash.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wallet Balance</span>
                          <span>₹{wallet.balance.toFixed(2)}</span>
                        </div>
                      </div>


                      
                    </div>

                    {/* <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-green-50 text-sm font-medium">
                            Available Balance
                          </span>
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <Wallet2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="text-white text-3xl md:text-4xl font-bold">
                          ₹{wallet.balance?.toFixed(2)}
                        </div>
                      </div>
                    </div> */}

                    <div className="relative overflow-hidden p-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-2xl shadow-xl hover:shadow-2xl transition-all">

                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-yellow-900 text-sm font-medium">
                            Promo Cash
                          </span>
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <Plus className="w-5 h-5 text-yellow-900" />
                          </div>
                        </div>
                        <div className="text-yellow-900 text-3xl md:text-4xl font-bold mb-2">
                          ₹{wallet.promoCash || 0}
                        </div>
                        {wallet.promoCashExpiresAt && (
                          <div className="flex items-center gap-2 text-yellow-800 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Expires {new Date(wallet.promoCashExpiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ArrowDown className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Recent Transactions
                      </h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchTransactions()}
                      disabled={isTxnLoading}
                      className="rounded-xl border-2 hover:bg-green-50 hover:border-green-300 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isTxnLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  {isTxnLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl">
                      <Loader2 className="animate-spin w-8 h-8 text-green-600 mb-3" />
                      <p className="text-gray-500 text-sm">Loading transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                      {transactions.map((txn) => (
                        <div
                          key={txn._id}
                          className="flex justify-between items-center p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:shadow-md hover:border-green-200 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl shadow-sm ${txn.type === "CREDIT"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                                }`}
                            >
                              {txn.type === "CREDIT" ? (
                                <ArrowDown className="w-5 h-5" />
                              ) : (
                                <ArrowUp className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold text-base">
                                {txn.description || txn.source}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {new Date(txn.createdAt).toLocaleDateString()}{" "}
                                  {new Date(txn.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${txn.type === "CREDIT"
                                  ? "text-green-600"
                                  : "text-red-600"
                                }`}
                            >
                              {txn.type === "CREDIT" ? "+" : "-"}₹{txn.amount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                        <ArrowDown className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No transactions yet</p>
                      <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-30"></div>
                  <div className="relative p-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                    <Wallet2 className="w-20 h-20 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Wallet Found
                </h3>
                <p className="text-gray-600 mb-8 text-base max-w-md leading-relaxed">
                  Create your wallet to start managing your balance and enjoy
                  exclusive promo offers!
                </p>
                <Button
                  onClick={() =>
                    void createWallet({
                      ownerId: user?._id as string,
                      ownerModel: user?.role as string,
                      ownerName: user?.firstName ?? "User",
                    })
                  }
                  disabled={isCreating}
                  className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Creating Wallet...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Wallet
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}