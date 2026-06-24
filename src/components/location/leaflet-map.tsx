"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

export type LatLng = { lat: number; lng: number };

// Avoid the classic broken default-marker-icon issue under bundlers by using a
// self-contained div icon.
const pinIcon = L.divIcon({
  className: "seapedia-pin",
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#c25a3c" stroke="white" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
    </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function ClickHandler({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function Recenter({ lat, lng }: LatLng) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

type LeafletMapProps = {
  lat: number;
  lng: number;
  onPick: (point: LatLng) => void;
};

export default function LeafletMap({ lat, lng, onPick }: LeafletMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "260px", width: "100%" }}
      className="z-0 rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        draggable
        icon={pinIcon}
        eventHandlers={{
          dragend(event) {
            const next = (event.target as L.Marker).getLatLng();
            onPick({ lat: next.lat, lng: next.lng });
          },
        }}
      />
      <ClickHandler onPick={onPick} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
