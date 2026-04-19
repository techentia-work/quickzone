"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui";
import { Loader2, ArrowLeft, X, LocateFixed } from "lucide-react";
import { CreateAddressPayload, LocationAddressStepType } from "@/lib/types";
import { useLocationPicker } from "@/hooks";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";

// ── Dynamically import react-leaflet components (SSR must be off) ──────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

// ── Inner component that gets map instance via useMap ─────────────────────
const MapController = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMap, useMapEvents } = mod;
      function Controller({
        position,
        onDragEnd,
      }: {
        position: { lat: number; lng: number };
        onDragEnd: (lat: number, lng: number) => void;
      }) {
        const map = useMap();

        // Keep map centered when position changes from GPS
        useEffect(() => {
          map.setView([position.lat, position.lng], map.getZoom() || 17);
        }, [position, map]);

        useMapEvents({
          dragend() {
            const c = map.getCenter();
            onDragEnd(c.lat, c.lng);
          },
        });
        return null;
      }
      return Controller;
    }),
  { ssr: false }
);

const defaultCenter = { lat: 27.1767, lng: 78.0081 };

interface LocationMapStepProps {
  onClose: () => void;
  form: CreateAddressPayload;
  setForm: React.Dispatch<React.SetStateAction<CreateAddressPayload>>;
  setStep: React.Dispatch<React.SetStateAction<LocationAddressStepType>>;
}

export default function LocationMapStep({
  onClose,
  form,
  setForm,
  setStep,
}: LocationMapStepProps) {
  const updateForm = (addr: Partial<CreateAddressPayload>) =>
    setForm((prev) => ({ ...prev, ...addr }));

  const initialPosition =
    form.location?.coordinates?.[0] !== 0
      ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] }
      : defaultCenter;

  const {
    position,
    setPosition,
    isDetecting,
    isFetchingAddress,
    detectCurrentLocation,
    fetchAddress,
  } = useLocationPicker(initialPosition);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ── Nominatim forward-geocode (search) ───────────────────────────────────
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query
          )}&countrycodes=in&limit=5&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newPos = { lat, lng };
    setPosition(newPos);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    fetchAddress(lat, lng, updateForm, true);
  };

  const handleDragEnd = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    fetchAddress(lat, lng, updateForm, true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <ArrowLeft
            size={20}
            className="cursor-pointer"
            onClick={() => setStep("list")}
          />
          <h2 className="font-semibold text-gray-800 text-lg">Pin Location</h2>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* ── Search Box ─────────────────────────────────────────────────── */}
      <div className="px-4 mb-3 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for area, street, city…"
            className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm outline-none focus:border-[#37A279]"
          />
          {isSearching && (
            <Loader2
              size={16}
              className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}
        </div>
        {searchResults.length > 0 && (
          <ul className="absolute left-4 right-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {searchResults.map((r) => (
              <li
                key={r.place_id}
                className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                onClick={() => handleResultSelect(r)}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Map + pin ──────────────────────────────────────────────────── */}
      <div className="relative flex-1 mx-4 mb-4 rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={17}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {/* @ts-ignore – dynamic import type mismatch is safe here */}
          <MapController position={position} onDragEnd={handleDragEnd} />
        </MapContainer>

        {/* Fixed center pin */}
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none z-[999]"
          style={{ transform: "translate(-50%, -100%)", marginTop: "-2px" }}
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

        {/* Address preview bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-3 shadow-lg rounded-t-xl text-sm z-[999]">
          {isFetchingAddress ? (
            <p className="text-gray-500 flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" /> Fetching address…
            </p>
          ) : form.googleLocation ? (
            <p className="text-gray-800 line-clamp-2">{form.googleLocation}</p>
          ) : (
            <p className="text-gray-500">Move map to select location</p>
          )}
        </div>
      </div>

      {/* ── Buttons ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 space-y-2">
        <Button
          onClick={() => detectCurrentLocation(updateForm)}
          disabled={isDetecting}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#37A279] text-[#37A279]"
        >
          {isDetecting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LocateFixed size={18} />
          )}
          {isDetecting ? "Detecting…" : "Use Current Location"}
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
  );
}