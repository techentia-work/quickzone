"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import { CreateAddressPayload } from "@/lib/types/address/address.payload";

// ─────────────────────────────────────────────────────────────────────────────
// Nominatim reverse-geocode (OpenStreetMap, no API key required)
// ─────────────────────────────────────────────────────────────────────────────
async function nominatimReverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Nominatim failed");
  return res.json();
}

export function useLocationPicker(initialPosition: { lat: number; lng: number }) {
  const [position, setPosition] = useState(initialPosition);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const lastFetchedPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAddress = useCallback(
    (
      lat: number,
      lng: number,
      updateForm: (addr: Partial<CreateAddressPayload>) => void,
      immediate = false
    ) => {
      if (lastFetchedPosRef.current) {
        const distance = Math.hypot(
          lastFetchedPosRef.current.lat - lat,
          lastFetchedPosRef.current.lng - lng
        );
        if (distance < 0.0001) return;
      }
      lastFetchedPosRef.current = { lat, lng };

      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);

      const doGeocode = async () => {
        setIsFetchingAddress(true);
        try {
          const data = await nominatimReverseGeocode(lat, lng);
          const addr = data.address ?? {};

          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.county ||
            addr.state_district ||
            "";

          updateForm({
            googleLocation: data.display_name ?? "",
            city,
            state: addr.state ?? "",
            pincode: addr.postcode ?? "",
            country: addr.country ?? "India",
            location: { type: "Point", coordinates: [lng, lat] },
          });
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          toast.error("Could not fetch address. Try moving the map.");
        } finally {
          setIsFetchingAddress(false);
        }
      };

      if (immediate) doGeocode();
      else geocodeTimeoutRef.current = setTimeout(doGeocode, 500);
    },
    []
  );

  const detectCurrentLocation = useCallback(
    (updateForm: (addr: Partial<CreateAddressPayload>) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          toast.error("Geolocation not supported by your browser.");
          reject(new Error("Not supported"));
          return;
        }

        setIsDetecting(true);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setPosition(loc);
            fetchAddress(loc.lat, loc.lng, updateForm, true);
            setIsDetecting(false);
            resolve();
          },
          (err) => {
            setIsDetecting(false);
            if (err.code === err.PERMISSION_DENIED) {
              toast.error("Location permission denied. Please allow location access.");
            } else {
              toast.error("Failed to get location. Enable location services.");
            }
            console.error(err);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    },
    [fetchAddress]
  );

  return {
    position,
    setPosition,
    isDetecting,
    isFetchingAddress,
    detectCurrentLocation,
    fetchAddress,
  };
}