"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search } from "lucide-react";
import type { LatLng } from "@/components/location/leaflet-map";

const LeafletMap = dynamic(
  () => import("@/components/location/leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[260px] place-items-center rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 text-sm text-[var(--muted)]">
        Loading map…
      </div>
    ),
  },
);

export type AddressValue = {
  fullAddress: string;
  lat?: number;
  lng?: number;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // Jakarta

export function MapPicker({
  value,
  onChange,
}: {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  const lat = value.lat ?? DEFAULT_CENTER.lat;
  const lng = value.lng ?? DEFAULT_CENTER.lng;

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query,
        )}`,
        { headers: { Accept: "application/json" } },
      );
      setResults(await response.json());
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function pickResult(result: NominatimResult) {
    onChange({
      fullAddress: result.display_name,
      lat: Number(result.lat),
      lng: Number(result.lon),
    });
    setResults([]);
    setQuery("");
  }

  async function pinTo(point: LatLng) {
    // Move the pin immediately, then resolve a readable address.
    onChange({ ...value, lat: point.lat, lng: point.lng });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.lat}&lon=${point.lng}`,
        { headers: { Accept: "application/json" } },
      );
      const data = await response.json();
      if (data?.display_name) {
        onChange({
          fullAddress: data.display_name,
          lat: point.lat,
          lng: point.lng,
        });
      }
    } catch {
      // keep coordinates even if reverse-geocoding fails
    }
  }

  return (
    <div className="grid gap-3">
      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-3 focus-within:border-[var(--danger)]">
          <Search size={16} className="text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search();
              }
            }}
            placeholder="Search a place, street, or city"
            className="min-h-11 w-full bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={search}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-[var(--danger)] hover:underline"
          >
            {searching ? "…" : "Search"}
          </button>
        </div>
        {results.length > 0 ? (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--line)] bg-white shadow-lg">
            {results.map((result) => (
              <li key={`${result.lat},${result.lon}`}>
                <button
                  type="button"
                  onClick={() => pickResult(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--soft)]"
                >
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-[var(--market)]"
                  />
                  <span className="line-clamp-2">{result.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Map */}
      <LeafletMap lat={lat} lng={lng} onPick={pinTo} />
      <p className="text-xs text-[var(--muted)]">
        Click the map or drag the pin to set the exact delivery point.
      </p>

      {/* Resolved address (editable) */}
      <label className="grid gap-1.5 text-sm font-semibold">
        <span>Full address</span>
        <textarea
          value={value.fullAddress}
          onChange={(event) =>
            onChange({ ...value, fullAddress: event.target.value })
          }
          rows={2}
          required
          placeholder="Pin a location above, or type the full address"
          className="rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-[var(--danger)] focus:ring-4 focus:ring-[rgba(194,90,60,0.14)]"
        />
      </label>
      {value.lat !== undefined && value.lng !== undefined ? (
        <p className="text-xs text-[var(--muted)]">
          Pinned at {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
