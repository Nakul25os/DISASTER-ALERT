import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const STATUS_COLORS = {
  ACTIVE:  { stroke: "#4ade80", fill: "#4ade80", glow: "rgba(74,222,128,0.5)" },
  STANDBY: { stroke: "#fbbf24", fill: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  FULL:    { stroke: "#f87171", fill: "#f87171", glow: "rgba(248,113,113,0.5)" },
};

export default function SafeZones({ regionData }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Cleanup previous
    layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
    layersRef.current = [];

    const zones = regionData?.safeZones || [];
    const layers = [];

    zones.forEach((zone, i) => {
      const col = STATUS_COLORS[zone.status] || STATUS_COLORS.ACTIVE;

      const outerRing = L.circle([zone.lat, zone.lng], {
        radius: zone.radius * 1.6,
        color: col.stroke, fillColor: col.fill, fillOpacity: 0.03,
        weight: 1, opacity: 0.3, dashArray: "6 8",
        interactive: false,
      }).addTo(map);

      const perimeter = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: col.stroke, fillColor: col.fill, fillOpacity: 0.08,
        weight: 2.5, opacity: 0.85,
        dashArray: zone.status === "STANDBY" ? "8 5" : null,
        interactive: false,
      }).addTo(map);

      const inner = L.circle([zone.lat, zone.lng], {
        radius: zone.radius * 0.35,
        color: col.stroke, fillColor: col.fill, fillOpacity: 0.18,
        weight: 1, opacity: 0.6,
        interactive: false,
      }).addTo(map);

      const icon = L.divIcon({
        className: "bg-transparent border-0",
        html: `
          <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;
              border:2px solid ${col.stroke};
              box-shadow:0 0 22px ${col.glow}, inset 0 0 12px ${col.glow};
              animation:szPulse 2.4s ease-in-out ${(i * 0.4).toFixed(1)}s infinite alternate;
              background:rgba(0,0,0,0.35);"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="${col.stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon })
        .bindPopup(`
          <div style="background:rgba(5,5,15,0.96);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${col.stroke}55;min-width:200px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;letter-spacing:0.12em;color:${col.stroke};font-weight:700;text-transform:uppercase;">
                Safe Zone
              </span>
              <span style="font-size:9px;padding:2px 7px;border-radius:20px;
                background:${col.stroke}22;color:${col.stroke};font-weight:700;">${zone.status}</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:8px;">${zone.name}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <div style="background:rgba(255,255,255,0.06);border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;">Capacity</div>
                <div style="font-size:14px;font-weight:700;color:${col.stroke};">${zone.capacity.toLocaleString()}</div>
              </div>
              <div style="background:rgba(255,255,255,0.06);border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;">Threat</div>
                <div style="font-size:14px;font-weight:700;color:${col.stroke};">${zone.threat}</div>
              </div>
            </div>
          </div>
        `)
        .addTo(map);

      layers.push(outerRing, perimeter, inner, marker);
    });

    layersRef.current = layers;
    return () => {
      layers.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
      layersRef.current = [];
    };
  }, [map, regionData]);

  return null;
}
