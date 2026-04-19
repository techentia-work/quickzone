import { useJsApiLoader } from "@react-google-maps/api";

const libraries: (
  "places" | "marker" | "geometry" | "drawing" | "visualization"
)[] = ["places", "marker"];

export function useGoogleMaps() {
  return useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });
}