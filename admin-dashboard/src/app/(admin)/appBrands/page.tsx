"use client";

import React from "react";
import { Plus, Tag, Trash2, Edit3, Loader2, GripVertical, ExternalLink } from "lucide-react";
import { useAdminAppBrand } from "@/hooks/entities/useAdminAppBrand";
import Link from "next/link";
import { ROUTES } from "@/lib/consts";
import Image from "next/image";

export default function AppBrandsListPage() {
  const { appBrands, isLoading, deleteAppBrand, toggleAppBrandStatus } = useAdminAppBrand();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading app brands...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">App Brands</h1>
          <p className="text-gray-500 mt-1">Manage which brands appear on the mobile application home screen</p>
        </div>
        <Link
          href={ROUTES.ADMIN.APPBRAND.ADD}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200 active:scale-95"
        >
          <Plus size={20} />
          Add App Brand
        </Link>
      </div>

      {appBrands.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Tag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No App Brands Found</h3>
          <p className="text-gray-500 max-w-xs mb-8">
            Start by adding brands that you want to highlight for your mobile app users.
          </p>
          <Link
            href={ROUTES.ADMIN.APPBRAND.ADD}
            className="text-emerald-600 font-bold hover:text-emerald-700 underline underline-offset-4"
          >
            Add your first brand now
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Brand Information</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appBrands.map((item: any) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-bold text-gray-900 bg-emerald-50 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center">
                        {item.order}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-white p-1">
                        <Image
                          src={item.brand?.thumbnail || "/placeholder.png"}
                          alt={item.brand?.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.brand?.name}</h4>
                        <p className="text-xs text-gray-400 font-medium lowercase">slug: {item.brand?.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {item.masterCategory ? (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold truncate block max-w-[120px]">
                        {item.masterCategory.name}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs italic">No Category</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                     <button
                       onClick={() => toggleAppBrandStatus(item._id)}
                       className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                         item.isActive 
                           ? "bg-emerald-100 text-emerald-700" 
                           : "bg-gray-100 text-gray-400"
                       }`}
                     >
                       {item.isActive ? "Active" : "Inactive"}
                     </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button
                         onClick={() => deleteAppBrand(item._id)}
                         className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                         title="Remove from App"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
