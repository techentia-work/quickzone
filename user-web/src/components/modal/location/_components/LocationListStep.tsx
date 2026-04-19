"use client";

import React from "react";
import { Button } from "@/components/ui";
import {
    LocateFixed,
    Plus,
    Loader2,
    X,
    Home,
    Briefcase,
    Star,
    Pencil,
    Trash2
} from "lucide-react";
import { LocationAddressStepType, CreateAddressPayload } from "@/lib/types";
import { useLocationPicker } from "@/hooks";
import { useAddress } from "@/hooks/entities/useAddress";
import toast from "react-hot-toast";

const defaultCenter = { lat: 27.1767, lng: 78.0081 };

interface LocationListStepProps {
    onClose: () => void;
    form: CreateAddressPayload;
    setForm: React.Dispatch<React.SetStateAction<CreateAddressPayload>>;
    setStep: React.Dispatch<React.SetStateAction<LocationAddressStepType>>;
}

export default function LocationListStep({
    onClose,
    form,
    setForm,
    setStep,
}: LocationListStepProps) {
    const updateForm = (addr: Partial<CreateAddressPayload>) => {
        setForm((prev) => ({ ...prev, ...addr }));
    };

    const { isDetecting, detectCurrentLocation } = useLocationPicker(defaultCenter);

    const {
        addresses,
        isLoading,
        setDefaultAddress,
        deleteAddress,
        isSettingDefault,
        isDeleting,
    } = useAddress();

    const handleDetect = async () => {
        await detectCurrentLocation(updateForm);
        if (!isDetecting) setStep("map");
    };

    const handleSetDefault = async (id: string) => {
        await setDefaultAddress(id);
    };

    return (
        <div className="flex flex-col max-h-[70vh]">
            {/* Header - Sticky */}
            <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Select Delivery Location
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Current Location Button */}
                <Button
                    onClick={handleDetect}
                    disabled={isDetecting}
                    className="w-full flex items-center justify-center gap-2 bg-[#37A279] hover:bg-[#2d8462] text-white"
                >
                    {isDetecting ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <LocateFixed size={18} />
                    )}
                    {isDetecting ? "Detecting..." : "Use My Current Location"}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span className="flex-1 h-px bg-gray-200"></span>
                    or
                    <span className="flex-1 h-px bg-gray-200"></span>
                </div>

                {/* Add New Address Button */}
                <Button
                    onClick={() => {
                        setStep("form");
                        setForm((prev) => ({
                            ...prev,
                            googleLocation: "",
                            location: { type: "Point", coordinates: [0, 0] },
                            city: "",
                            state: "",
                            pincode: "",
                            _id: undefined, // Clear ID for create mode
                        }));
                    }}
                    className="bg-[#FFC908] hover:bg-[#e6b607] text-black w-full flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add New Address Manually
                </Button>

                {/* Saved Addresses Section */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading addresses...</span>
                    </div>
                ) : addresses && addresses.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Saved Addresses
                        </h3>

                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`
                                        border rounded-lg p-4 transition-all duration-200
                                        ${address.isDefault
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                        }
                                    `}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${address.type === "WORK"
                                                    ? "bg-blue-100"
                                                    : "bg-green-100"
                                                    }`}
                                            >
                                                {address.type === "WORK" ? (
                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Home className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Address Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900 capitalize">
                                                    {address.customLabel || address.type}
                                                </h4>
                                                {address.isDefault && (
                                                    <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-200 rounded-full">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-700 font-medium mb-1">
                                                {address.fullName}
                                            </p>

                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {address.addressLine1}
                                                {address.addressLine2 && `, ${address.addressLine2}`}
                                                <br />
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                📞 {address.phone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {!address.isDefault && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => handleSetDefault(address._id)}
                                                disabled={isSettingDefault}
                                                className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Star className="w-4 h-4" />
                                                Set Default
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No saved addresses yet</p>
                        <p className="text-sm mt-1">Add your first address to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}