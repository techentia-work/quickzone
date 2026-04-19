"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormInput,
  FormSelect,
  FormCheckbox,
} from "@/components";
import toast from "react-hot-toast";
import { useAdminPromo } from "@/hooks/entities/useAdminPromo";

export default function EditPromoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { updatePromo, getPromoByIdQuery } = useAdminPromo();

  // ✅ Call hook directly here (NOT in useEffect)
  const { data: promo, isLoading, error } = getPromoByIdQuery(id as string);

  console.log("Promo....", promo);
  const promocode = (promo as any)?.promocode;

  const [formData, setFormData] = useState<any>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Populate form when data loads
  useEffect(() => {
    if (promo) {
      setFormData({
        code: promocode.code || "",
        description: promocode.description || "",
        discountType: promocode.discountType || "PERCENTAGE",
        discountValue: promocode.discountValue || "",
        minOrderValue: promocode.minCartValue || "",
        startDate:
          promocode.createdAt && !isNaN(new Date(promocode.createdAt).getTime())
            ? new Date(promocode.createdAt).toISOString().slice(0, 10)
            : "",
        endDate:
          promocode.endDate && !isNaN(new Date(promocode.endDate).getTime())
            ? new Date(promocode.endDate).toISOString().slice(0, 10)
            : "",
        isActive: promo.active ?? true,
      });
    }
  }, [promo]);

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === "" || isNaN(Number(value))
            ? undefined
            : Number(value)
          : value,
    }));
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code) newErrors.code = "Promo code is required";
    if (!formData.discountType)
      newErrors.discountType = "Discount type is required";
    if (!formData.discountValue)
      newErrors.discountValue = "Discount value is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setSaving(true);

      // ✅ Format data correctly before sending
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue:
          formData.minOrderValue === ""
            ? undefined
            : Number(formData.minOrderValue),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: Boolean(formData.isActive),
      };

      console.log("Payload being sent:", payload);

      const res = await updatePromo(id as string, payload);

      if (res.success) {
        toast.success("Promo updated successfully!");
        router.push("/promocode");
      } else {
        toast.error(res.message || "Failed to update promo");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update promo");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle loading & error
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load promo.
      </div>
    );

  if (!promo)
    return (
      <div className="text-center py-20 text-gray-500">Promo not found</div>
    );

  // ✅ Form UI
  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Promo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <FormInput
              label="Promo Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
            />
            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <FormSelect
              label="Discount Type"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              options={[
                { value: "PERCENTAGE", label: "Percentage" },
                { value: "FLAT", label: "Flat Amount" },
              ]}
              error={errors.discountType}
            />
            <FormInput
              label="Discount Value"
              name="discountValue"
              type="number"
              value={formData.discountValue}
              onChange={handleChange}
              error={errors.discountValue}
            />
            <FormInput
              label="Minimum Order Value"
              name="minOrderValue"
              type="number"
              value={formData.minOrderValue}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <FormInput
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </div>
            <FormCheckbox
              label="Active"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/promocode")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
