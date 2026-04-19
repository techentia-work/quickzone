import React, { useEffect, useState, } from "react";
import { X, Loader2, ArrowLeft, } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { useAddress } from "@/hooks/entities/useAddress";
import { CreateAddressPayload } from "@/lib/types/address/address.payload";
import { AddressLabelType } from "@/lib/types/address/address.enums";
import { defaultAddressForm } from "@/lib/consts";
import { LocationAddressStepType } from "@/lib/types";

export default function LocationModalForm({ onClose, Step, setStep, form, setForm }: { onClose: () => void, Step: LocationAddressStepType, setStep: React.Dispatch<React.SetStateAction<LocationAddressStepType>>, form: CreateAddressPayload, setForm: React.Dispatch<React.SetStateAction<CreateAddressPayload>> }) {

    const { createAddress } = useAddress();

    const [isSaving, setIsSaving] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<AddressLabelType>(AddressLabelType.HOME);
    const [customLabel, setCustomLabel] = useState("");
    const [error, setError] = useState("");

    const validateForm = () => {
        const errors: string[] = [];

        if (!form.fullName?.trim()) errors.push("Full name is required");
        if (!form.phone?.trim()) errors.push("Phone number is required");
        else if (!/^\d{10}$/.test(form.phone))
            errors.push("Phone must be 10 digits");

        if (!form.addressLine1?.trim()) errors.push("Address is required");
        if (!form.city?.trim()) errors.push("City is required");
        if (!form.state?.trim()) errors.push("State is required");
        if (!form.pincode?.trim()) errors.push("Pincode is required");
        else if (!/^\d{6}$/.test(form.pincode))
            errors.push("Pincode must be 6 digits");

        if (selectedLabel === AddressLabelType.CUSTOM && !customLabel.trim())
            errors.push("Custom label is required");

        if (errors.length > 0)
            toast.error(errors[0]);
        return errors.length === 0;
    };

    const handleSaveAddress = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            const res = await createAddress(form);
            if (res.success) {
                setForm(defaultAddressForm);
                onClose();
            }
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        setForm((prev) => ({ ...prev, label: selectedLabel, type: selectedLabel, customLabel: selectedLabel === AddressLabelType.CUSTOM ? customLabel : undefined, }));
    }, [selectedLabel, customLabel]);

    useEffect(() => {
        setForm(p => ({ ...defaultAddressForm, googleLocation: p.googleLocation }));
        setSelectedLabel(AddressLabelType.HOME);
        setCustomLabel("");
    }, [Step]);

    return (
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <ArrowLeft
                        size={20}
                        className="cursor-pointer"
                        onClick={() => setStep(p => p === "list" ? "list" : "list")}
                    />
                    <h2 className="font-semibold text-gray-800 text-lg">
                        Add Details
                    </h2>
                </div>
                <button onClick={onClose}>
                    <X size={18} />
                </button>
            </div>


            {/* ---------- Label selection ---------- */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Label *</label>
                <div className="flex gap-4">
                    {Object.values(AddressLabelType).map((lbl) => (
                        <label
                            key={lbl}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="label"
                                value={lbl}
                                checked={selectedLabel === lbl}
                                onChange={() => setSelectedLabel(lbl)}
                                className="accent-[#37A279]"
                            />
                            <span className="capitalize">{lbl.toLowerCase()}</span>
                        </label>
                    ))}
                </div>

                {selectedLabel === AddressLabelType.CUSTOM && (
                    <Input
                        placeholder="Enter custom label*"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        errLabel={false}
                    />
                )}
            </div>

            {/* ---------- Rest of the form ---------- */}
            <Input
                markAsRequired={true}
                placeholder="Full Name*"
                value={form.fullName}
                onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                }
                errLabel={false}
            />
            <Input
                placeholder="Phone Number*"
                value={form.phone}
                onChange={(e) =>
                    setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                    })
                }
                errLabel={false}
            />
            <Input
                placeholder="Flat, House No, Building*"
                value={form.addressLine1}
                onChange={(e) =>
                    setForm({ ...form, addressLine1: e.target.value })
                }
                errLabel={false}
            />
            <Input
                placeholder="Area, Street (Optional)"
                value={form.addressLine2}
                onChange={(e) =>
                    setForm({ ...form, addressLine2: e.target.value })
                }
                errLabel={false}
            />
            {/* ---------- Google location (read-only) ---------- */}
            {
                form.googleLocation &&
                <Input
                    placeholder="Google Location"
                    value={form.googleLocation ?? ""}
                    disabled
                    className="bg-gray-50"
                    errLabel={false}
                />
            }
            <Input
                placeholder="Landmark (Optional)"
                value={form.landmark}
                onChange={(e) =>
                    setForm({ ...form, landmark: e.target.value })
                }
                errLabel={false}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    placeholder="City*"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    errLabel={false}
                />
                <Input
                    placeholder="Pincode*"
                    value={form.pincode}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            pincode: e.target.value.replace(/\D/g, ""),
                        })
                    }
                    errLabel={false}
                />
            </div>
            <Input
                placeholder="State*"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                errLabel={false}
            />

            {/* {
                error &&
                <p className={"w-full text-sm leading-[25.89px] text-start min-h-[1.6rem] text-[#ff3131] font-normal"}>{error}</p>
            } */}

            <div className="flex gap-3 pt-2">
                <Button
                    className="flex-1 bg-[#37A279] text-white"
                    onClick={handleSaveAddress}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        "Save Address"
                    )}
                </Button>
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(p => p === "list" ? "list" : "map")}
                >
                    Back
                </Button>
            </div>
        </div>
    )
}