"use client";

import React, { useEffect, useState, useCallback, useRef, } from "react";
import { LocateFixed, Plus, X, Loader2, ArrowLeft, } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "@/components/ui";
import { useAddress } from "@/hooks/entities/useAddress";
import { CreateAddressPayload } from "@/lib/types/address/address.payload";
import { AddressLabelType } from "@/lib/types/address/address.enums";
import BaseModal from "../BaseModal";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { defaultAddressForm } from "@/lib/consts";
import { LocationAddressStepType } from "@/lib/types";

const libraries: ("places" | "marker")[] = ["places", "marker"];
const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 27.1767, lng: 78.0081 };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
  clickableIcons: false,
  mapId: "DEMO_MAP_ID",
};

export default function LocationModal({ isOpen, onClose, Step, }: { isOpen: boolean; onClose: () => void; Step: LocationAddressStepType; }) {

  const [form, setForm] = useState<CreateAddressPayload>(defaultAddressForm);
  const [step, setStep] = useState<LocationAddressStepType>(Step);
  const [isDetecting, setIsDetecting] = useState(false);

  const [position, setPosition] = useState(defaultCenter);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const lastFetchedPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  /*  Reset everything when the modal opens*/
  useEffect(() => {
    if (isOpen) {
      setStep(Step);
      setPosition(defaultCenter);
      setIsFetchingAddress(false);
      lastFetchedPosRef.current = null;
    }
  }, [isOpen, Step]);

  /*  Keep map centered when position changes*/
  useEffect(() => {
    if (mapRef && position) mapRef.setCenter(position);
  }, [position, mapRef]);

  /*  GEOCODE – only when the map is dragged*/
  const fetchAddress = useCallback(
    (lat: number, lng: number, immediate = false) => {
      if (lastFetchedPosRef.current) {
        const distance = Math.hypot(
          lastFetchedPosRef.current.lat - lat,
          lastFetchedPosRef.current.lng - lng
        );
        if (distance < 0.0001) return;
      }
      lastFetchedPosRef.current = { lat, lng };

      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);

      const doGeocode = () => {
        setIsFetchingAddress(true);
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            setIsFetchingAddress(false);
            const addr = results[0];
            const get = (type: string) =>
              addr.address_components?.find((c) => c.types.includes(type))
                ?.long_name ?? "";

            setForm((prev) => ({
              ...prev,
              googleLocation: addr.formatted_address ?? "",
              city:
                get("locality") ||
                get("sublocality_level_1") ||
                get("administrative_area_level_2") ||
                "",
              state: get("administrative_area_level_1") ?? "",
              pincode: get("postal_code") ?? "",
              country: get("country") ?? "India",
              location: { type: "Point", coordinates: [lng, lat] },
            }));
          } else {
            // fallback request
            setTimeout(() => {
              const geocoder2 = new window.google.maps.Geocoder();
              geocoder2.geocode(
                { location: { lat, lng } },
                (results2, status2) => {
                  setIsFetchingAddress(false);
                  if (status2 === "OK" && results2?.[0]) {
                    const addr = results2[0];
                    const get = (type: string) =>
                      addr.address_components?.find((c) =>
                        c.types.includes(type)
                      )?.long_name ?? "";

                    setForm((prev) => ({
                      ...prev,
                      googleLocation: addr.formatted_address ?? "",
                      city:
                        get("locality") ||
                        get("sublocality_level_1") ||
                        get("administrative_area_level_2") ||
                        "",
                      state: get("administrative_area_level_1") ?? "",
                      pincode: get("postal_code") ?? "",
                      country: get("country") ?? "India",
                      location: { type: "Point", coordinates: [lng, lat] },
                    }));
                  } else {
                    toast.error("Could not fetch address. Try moving the map.");
                  }
                }
              );
            }, 500);
          }
        });
      };

      if (immediate) doGeocode();
      else geocodeTimeoutRef.current = setTimeout(doGeocode, 400);
    },
    []
  );

  /*  MAP callbacks*/
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapRef(map);

      map.addListener("dragstart", () => {
        isDraggingRef.current = true;
      });

      map.addListener("dragend", () => {
        isDraggingRef.current = false;
        const center = map.getCenter();
        if (center) {
          const newPos = { lat: center.lat(), lng: center.lng() };
          setPosition(newPos);
          fetchAddress(newPos.lat, newPos.lng, true);
        }
      });

      map.addListener("zoom_changed", () => {
        if (!isDraggingRef.current) {
          const center = map.getCenter();
          if (center) setPosition({ lat: center.lat(), lng: center.lng() });
        }
      });
    },
    [fetchAddress]
  );

  const onMapUnmount = useCallback(() => setMapRef(null), []);

  /*  AUTOCOMPLETE (search box)*/
  useEffect(() => {
    if (!isLoaded || !mapRef || !autocompleteContainerRef.current) return;

    const container = autocompleteContainerRef.current!;
    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: ["in"] },
    });

    Object.assign(autocomplete.style, {
      width: "100%",
      height: "48px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "0 12px",
      fontSize: "14px",
      outline: "none",
    });

    container.innerHTML = "";
    container.appendChild(autocomplete);

    const handlePlaceSelect = async (e: any) => {
      const { placePrediction } = e;
      if (!placePrediction) return;

      const place = placePrediction.toPlace();
      try {
        await place.fetchFields({
          fields: [
            "location",
            "formattedAddress",
            "addressComponents",
            "viewport",
          ],
        });

        const lat = place.location!.lat();
        const lng = place.location!.lng();
        const newPos = { lat, lng };
        setPosition(newPos);

        if (mapRef) {
          if (place.viewport) mapRef.fitBounds(place.viewport);
          else mapRef.setZoom(17);
        }

        const getComponent = (types: string[]) =>
          place.addressComponents?.find((c: any) =>
            types.some((t: string) => c.types.includes(t))
          )?.longText ?? "";


        setForm((prev) => ({
          ...prev,
          googleLocation: place.formattedAddress ?? "",
          city: getComponent([
            "locality",
            "sublocality_level_1",
            "administrative_area_level_2",
          ]),
          state: getComponent(["administrative_area_level_1"]),
          pincode: getComponent(["postal_code"]),
          country: getComponent(["country"]) ?? "India",
          location: { type: "Point", coordinates: [lng, lat] },
        }));

        toast.success("Location selected!");
      } catch {
        toast.error("Failed to load place.");
      }
    };

    autocomplete.addEventListener("gmp-select", handlePlaceSelect);
    return () => {
      autocomplete.removeEventListener("gmp-select", handlePlaceSelect);
      autocomplete.remove();
    };
  }, [isLoaded, mapRef]);

  /*  DETECT CURRENT LOCATION*/
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    setIsDetecting(true);
    const loadingToast = toast.loading("Detecting location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadingToast);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        if (mapRef) {
          mapRef.setCenter(loc);
          mapRef.setZoom(17);
        }
        fetchAddress(loc.lat, loc.lng, true);
        setStep("map");
        setIsDetecting(false);
        toast.success("Location detected!");
      },
      (error) => {
        toast.dismiss(loadingToast);
        setIsDetecting(false);
        toast.error(
          "Failed to get location. Please enable location services."
        );
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  if (loadError) {
    return (
      <BaseModal isOpen={isOpen} closeModal={onClose} className="p-6">
        <div className="text-center text-red-500">
          <p>Failed to load Google Maps.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </BaseModal>
    );
  }

  if (!isOpen) return null;

  /*  RENDER                                                            */
  return (
    <BaseModal
      isOpen={isOpen}
      closeModal={onClose}
      className="p-0 bg-white max-w-lg w-[100%] rounded-xl overflow-hidden h-[50vh] flex flex-col"
    >
      {/* ====================== LIST ====================== */}
      {step === "list" && (
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Select Delivery Location</h2>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <Button
            onClick={detectCurrentLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 bg-[#37A279] text-white"
          >
            {isDetecting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Detecting...
              </>
            ) : (
              <>
                <LocateFixed size={18} /> Use My Current Location
              </>
            )}
          </Button>

          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="flex-1 h-px bg-gray-200"></span>
            or
            <span className="flex-1 h-px bg-gray-200"></span>
          </div>

          {/* ---- SKIP MAP → go straight to FORM ---- */}
          <Button
            onClick={() => {
              setStep("form");
              // pre-fill with empty location (user will type everything)
              setForm((prev) => ({
                ...prev,
                googleLocation: "",
                location: { type: "Point", coordinates: [0, 0] },
              }));
            }}
            className="bg-[#FFC908] hover:bg-[#e6b607] text-black w-full flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New Address
          </Button>
        </div>
      )}

      {/* ====================== MAP ====================== */}
      {step === "map" && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <ArrowLeft
                size={20}
                className="cursor-pointer text-gray-700"
                onClick={() => setStep("list")}
              />
              <h2 className="font-semibold text-gray-800 text-lg">
                Pin Location
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="px-4 mb-3">
            <div ref={autocompleteContainerRef} className="h-12" />
          </div>

          <div className="relative flex-1 mx-4 mb-4 rounded-xl overflow-hidden shadow-lg">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <Loader2 className="animate-spin text-[#37A279]" size={32} />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={position}
                zoom={16}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                options={mapOptions}
              />
            )}

            {/* Pin icon */}
            <div
              className="absolute top-1/2 left-1/2 pointer-events-none z-10"
              style={{
                transform: "translate(-50%, -100%)",
                marginTop: "-2px",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#37A279"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <circle cx="12" cy="9" r="2" fill="white" />
              </svg>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white p-3 shadow-lg rounded-t-xl text-sm">
              {isFetchingAddress ? (
                <p className="text-gray-500 flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin" /> Fetching
                  address...
                </p>
              ) : form.googleLocation ? (
                <p className="text-gray-800 line-clamp-2">
                  {form.googleLocation}
                </p>
              ) : (
                <p className="text-gray-500">Move map to select location</p>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 space-y-2">
            <Button
              onClick={detectCurrentLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#37A279] text-[#37A279]"
            >
              {isDetecting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <LocateFixed size={18} />
              )}
              Use Current Location
            </Button>

            <Button
              onClick={() => form.googleLocation && setStep("form")}
              className="w-full bg-[#37A279] text-white font-medium"
              disabled={!form.googleLocation || isFetchingAddress}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      )}

      {/* ====================== FORM ====================== */}
      {step === "form" && (
        <LocationModalForm onClose={onClose} Step={Step} setStep={setStep} form={form} setForm={setForm} />
      )}
    </BaseModal>
  );
}

export function LocationModalForm({ onClose, Step, setStep, form, setForm }: { onClose: () => void, Step: LocationAddressStepType, setStep: React.Dispatch<React.SetStateAction<LocationAddressStepType>>, form: CreateAddressPayload, setForm: React.Dispatch<React.SetStateAction<CreateAddressPayload>> }) {

  const { createAddress } = useAddress();

  const [isSaving, setIsSaving] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<AddressLabelType>(AddressLabelType.HOME);
  const [customLabel, setCustomLabel] = useState("");

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

    errors.forEach((e) => toast.error(e));
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
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      label: selectedLabel,
      type: selectedLabel,
      customLabel: selectedLabel === AddressLabelType.CUSTOM ? customLabel : undefined,
    }));
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
            placeholder="Enter custom label *"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            errLabel={false}
          />
        )}
      </div>

      {/* ---------- Rest of the form ---------- */}
      <Input
        placeholder="Full Name *"
        value={form.fullName}
        onChange={(e) =>
          setForm({ ...form, fullName: e.target.value })
        }
        errLabel={false}
      />
      <Input
        placeholder="Phone Number *"
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
        placeholder="Flat, House No, Building *"
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
          placeholder="City *"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          errLabel={false}
        />
        <Input
          placeholder="Pincode *"
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
        placeholder="State *"
        value={form.state}
        onChange={(e) => setForm({ ...form, state: e.target.value })}
        errLabel={false}
      />

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