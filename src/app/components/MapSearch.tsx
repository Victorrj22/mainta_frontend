"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

interface MapSearchProps {
  value: string;
  onChange: (address: string) => void;
}

export default function MapSearch({ value, onChange }: MapSearchProps) {
  const [results, setResults] = useState<any[]>([]);
  const [position, setPosition] = useState<[number, number]>([34.0522, -118.2437]); // Default LA
  const [isSearching, setIsSearching] = useState(false);

  // When value changes externally (like clicking a saved address), search location on map
  useEffect(() => {
    if (value && value.length > 5) {
      // Small timeout to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        searchLocation(value, true);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  }, [value]);

  const searchLocation = async (text: string, silent = false) => {
    if (!text || text.length < 3) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`);
      const data = await res.json();
      setResults(data);
      if (data.length > 0 && silent) {
        // Automatically move map to first result if it's from a direct prop update (silent search)
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: any) => {
    setPosition([parseFloat(item.lat), parseFloat(item.lon)]);
    setResults([]);
    onChange(item.display_name);
  };

  return (
    <div style={{ position: "relative", width: "100%", zIndex: 10 }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="modern-input"
          placeholder="Start typing an address..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value); // Sync with parent state immediately
            if (e.target.value.length > 3) {
              setIsSearching(true);
              // We rely on the useEffect above to do the debounced search
            } else {
              setResults([]);
              setIsSearching(false);
            }
          }}
          onBlur={() => setTimeout(() => setResults([]), 200)} // Delay so click registers
        />
        {isSearching && (
          <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "gray" }}>
            Searching...
          </span>
        )}
      </div>

      {results.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
          listStyle: "none",
          padding: 0,
          margin: "4px 0 0 0",
          maxHeight: "200px",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 1000
        }}>
          {results.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSelect(item)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: i < results.length - 1 ? "1px solid #eee" : "none",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}

      <div style={{ height: "300px", width: "100%", marginTop: "16px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-color)", zIndex: 0 }}>
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapUpdater center={position} />
        </MapContainer>
      </div>
    </div>
  );
}
