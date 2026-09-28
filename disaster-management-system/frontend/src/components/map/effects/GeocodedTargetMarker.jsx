import React, { useEffect } from "react";
import { Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { Crosshair, MapPin, Navigation, X, ShieldAlert, Radio } from "lucide-react";

export default function GeocodedTargetMarker({ location, onClear }) {
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return null;
  }

  const icon = L.divIcon({
    className: "geocoded-target-pin bg-transparent border-0",
    html: `
      <div class="relative w-12 h-12 flex items-center justify-center cursor-pointer group">
        <!-- Outer targeting reticle ring -->
        <div class="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 opacity-80 animate-[spin_8s_linear_infinite]"></div>
        <div class="absolute -inset-2 rounded-full border border-cyan-500/30 opacity-60 animate-ping" style="animation-duration: 2.5s;"></div>
        
        <!-- Crosshair ticks -->
        <div class="absolute -top-1 w-0.5 h-2 bg-cyan-400"></div>
        <div class="absolute -bottom-1 w-0.5 h-2 bg-cyan-400"></div>
        <div class="absolute -left-1 h-0.5 w-2 bg-cyan-400"></div>
        <div class="absolute -right-1 h-0.5 w-2 bg-cyan-400"></div>

        <!-- Center Precision Core -->
        <div class="relative w-5 h-5 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,1)]">
          <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -26],
  });

  return (
    <>
      {/* Precision concentric radar circles around geocoded target */}
      <Circle
        center={[location.lat, location.lng]}
        radius={1500}
        pathOptions={{
          color: "#00f0ff",
          fillColor: "#00f0ff",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "4, 6",
          interactive: false,
        }}
      />
      <Circle
        center={[location.lat, location.lng]}
        radius={600}
        pathOptions={{
          color: "#00f0ff",
          fillColor: "#00f0ff",
          fillOpacity: 0.15,
          weight: 2,
          interactive: false,
        }}
      />

      {/* Target Pin Marker */}
      <Marker
        position={[location.lat, location.lng]}
        icon={icon}
        zIndexOffset={3000}
      >
        <Popup
          autoPan={true}
          className="custom-geocoded-popup"
        >
          <div className="p-3 bg-slate-950 text-white rounded-xl border border-cyan-500/40 min-w-[240px] max-w-[280px] font-sans shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geocoded Target</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                {location.category || "Location"}
              </span>
            </div>

            <h4 className="text-xs font-extrabold text-white leading-snug mb-1">
              {location.name}
            </h4>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              {location.displayName || location.name}
            </p>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2 text-[10px] font-mono grid grid-cols-2 gap-1 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[8px] uppercase">Latitude</span>
                <span className="text-cyan-300 font-bold">{location.lat.toFixed(4)}°N</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px] uppercase">Longitude</span>
                <span className="text-cyan-300 font-bold">{location.lng.toFixed(4)}°E</span>
              </div>
            </div>

            {onClear && (
              <button
                onClick={onClear}
                className="w-full py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear Target Pin</span>
              </button>
            )}
          </div>
        </Popup>
      </Marker>
    </>
  );
}
