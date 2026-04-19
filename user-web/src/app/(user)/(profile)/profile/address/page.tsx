"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Star,
  Loader2,
  Plus,
  Home,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useAddress } from "@/hooks/entities/useAddress";
import { CreateAddressPayload } from "@/lib/types/address/address.payload";
import { Button, Input } from "@/components/ui";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const LocationModal = dynamic(
  () => import("../../../../../components/modal/location/LocationModal"),
  {
    ssr: false,
  }
);

export default function AddressPage() {
  const {
    addresses,
    isLoading,
    isError,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress();

  const [open, setOpen] = useState(false);
  const [addingWithLocationOpen, setAddingWithLocationOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateAddressPayload>();

  const onSubmit = async (data: CreateAddressPayload) => {
    try {
      if (editingAddress) {
        await updateAddress({ id: editingAddress._id, data });
        toast.success("Address updated!");
      } else {
        await createAddress(data);
        toast.success("Address added!");
      }
      setOpen(false);
      reset();
      setEditingAddress(null);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    reset(address);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(id);
      toast.success("Address deleted");
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
    toast.success("Default address set");
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-green-600" />
          <p className="text-gray-600 font-medium">Loading addresses...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center">
        <p className="text-gray-600 font-medium">Failed to load addresses.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    My Addresses
                  </h1>
                  <p className="text-green-50 mt-1 text-base">
                    Manage your delivery addresses
                  </p>
                </div>
              </div>

              
            </div>
          </div>

          {/* Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-full h-[80%] max-w-full overflow-y-auto bg-gradient-to-br from-white to-white backdrop-blur-sm rounded-none shadow-2xl text-gray-800 p-0 border-0 mt-5">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 md:px-8 py-6 sticky top-0 z-10 shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      {editingAddress ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </DialogTitle>
                  <p className="text-green-50 mt-2 text-sm">Fill in the details below</p>
                </DialogHeader>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 p-6 md:p-8 max-w-4xl mx-auto"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Label
                    </label>
                    <Input
                      placeholder="e.g., My Home, Office"
                      {...register("label", { required: true })}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Address Type
                    </label>
                    <select
                      {...register("type")}
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    >
                      <option value="HOME">🏠 Home</option>
                      <option value="WORK">💼 Work</option>
                      <option value="CUSTOM">✨ Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Custom Label (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Parents House, Friend's Place"
                      {...register("customLabel")}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Full Name *
                      </label>
                      <Input
                        placeholder="John Doe"
                        {...register("fullName", { required: true })}
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Phone Number *
                      </label>
                      <Input
                        placeholder="9876543210"
                        {...register("phone", { required: true })}
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Alternate Phone
                    </label>
                    <Input
                      placeholder="9876543211"
                      {...register("alternatePhone")}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Address Line 1 *
                    </label>
                    <Input
                      placeholder="House/Flat No., Street"
                      {...register("addressLine1", { required: true })}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Address Line 2
                    </label>
                    <Input
                      placeholder="Area, Colony"
                      {...register("addressLine2")}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                      Landmark
                    </label>
                    <Input
                      placeholder="Near City Mall"
                      {...register("landmark")}
                      className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        City *
                      </label>
                      <Input
                        placeholder="Mumbai"
                        {...register("city", { required: true })}
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        State *
                      </label>
                      <Input
                        placeholder="Maharashtra"
                        {...register("state", { required: true })}
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Pincode *
                      </label>
                      <Input
                        placeholder="400001"
                        {...register("pincode", { required: true })}
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
                        Country
                      </label>
                      <Input
                        placeholder="India"
                        {...register("country")}
                        defaultValue="India"
                        className="border-2 border-gray-200 rounded-xl p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 cursor-pointer hover:shadow-md transition-all">
                    <input
                      type="checkbox"
                      {...register("isDefault")}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      ⭐ Set as default address
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t-2 border-gray-200 sticky bottom-0 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm pb-6 -mx-6 md:-mx-8 px-6 md:px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingAddress ? (
                      "✓ Update Address"
                    ) : (
                      "✓ Add Address"
                    )}
                  </Button>

                  {editingAddress && (
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 hover:bg-gray-100 rounded-xl py-3 font-bold text-base transition-all"
                        onClick={() => {
                          setEditingAddress(null);
                          reset();
                          setOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <LocationModal
            isOpen={addingWithLocationOpen}
            onClose={() => setAddingWithLocationOpen(false)}
            Step="list"
          />

          {/* Content */}
          <div className="p-6 md:p-8">
            {addresses?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-30"></div>
                  <div className="relative p-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                    <Home className="w-20 h-20 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No addresses yet
                </h3>
                <p className="text-gray-600 mb-8 text-base max-w-md leading-relaxed">
                  Add your first delivery address to get started
                </p>
                <Button
                  onClick={() => setAddingWithLocationOpen(true)}
                  className="px-8 py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div
                    key={address._id}
                    className="relative overflow-hidden bg-gradient-to-r from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:shadow-xl hover:border-green-200 transition-all p-6"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/20 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                              address.type === "WORK"
                                ? "bg-gradient-to-br from-blue-400 to-blue-600"
                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                            }`}
                          >
                            {address.type === "WORK" ? (
                              <Briefcase className="w-7 h-7 text-white" />
                            ) : (
                              <Home className="w-7 h-7 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 capitalize text-xl">
                              {address.customLabel || address.type}
                            </h3>
                            {address.isDefault && (
                              <span className="px-3 py-1 text-xs font-bold text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full shadow-sm">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-base text-gray-900 font-semibold mb-2">
                            {address.fullName}
                          </p>

                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                            {address.landmark && `, ${address.landmark}`}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                          </p>

                          <p className="text-sm text-gray-600 font-medium">
                            📞 {address.phone}
                            {address.alternatePhone &&
                              ` • ${address.alternatePhone}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-3 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all shadow-sm hover:shadow-md"
                          title="Edit address"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
                          className="p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all shadow-sm hover:shadow-md"
                          title="Delete address"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id)}
                            className="p-3 rounded-xl text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-all shadow-sm hover:shadow-md"
                            title="Set as default"
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}