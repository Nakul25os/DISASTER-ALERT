import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const RISK_STYLE = {
  CRITICAL: { color: "#ef4444", fill: "#ef4444", fillOpacity: 0.22, weight: 2.5, glow: "rgba(239,68,68,0.6)" },
  HIGH:     { color: "#f97316", fill: "#f97316", fillOpacity: 0.16, weight: 2,   glow: "rgba(249,115,22,0.5)" },
  MEDIUM:   { color: "#eab308", fill: "#eab308", fillOpacity: 0.12, weight: 1.5, glow: "rgba(234,179,8,0.45)" },
};

export default function FloodRiskZones({ regionData }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Cleanup previous
    layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
    layersRef.current = [];

    const zones = regionData?.floodZones || [];
    const layers = [];

    zones.forEach((zone) => {
      const s = RISK_STYLE[zone.risk] || RISK_STYLE.MEDIUM;

      const poly = L.polygon(zone.coords, {
        color: s.color, fillColor: s.fill, fillOpacity: s.fillOpacity,
        weight: s.weight, opacity: 0.9,
        dashArray: zone.risk === "MEDIUM" ? "8 5" : null,
      }).addTo(map);

      // Glow outer border
      const glowPoly = L.polygon(zone.coords, {
        color: s.color, fillOpacity: 0, weight: 6, opacity: 0.12,
        interactive: false,
      }).addTo(map);

      // Label at centroid
      const center = poly.getBounds().getCenter();
      const labelIcon = L.divIcon({
        className: "bg-transparent border-0",
        html: `
          <div style="
            background:rgba(0,0,0,0.82);
            border:1px solid ${s.color}88;
            border-radius:6px;padding:3px 7px;
            white-space:nowrap;font-family:Inter,sans-serif;
            font-size:9px;font-weight:700;color:${s.color};
            letter-spacing:0.08em;text-transform:uppercase;
            box-shadow:0 0 10px ${s.glow};
          ">▲ ${zone.risk} FLOOD RISK</div>
        `,
        iconAnchor: [0, 0],
      });

      const popup = `
        <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
          border:1px solid ${s.color}55;min-width:220px;font-family:Inter,sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:10px;letter-spacing:0.1em;color:${s.color};font-weight:700;text-transform:uppercase;">
              FLOOD INUNDATION ZONE
            </span>
            <span style="font-size:9px;padding:2px 8px;border-radius:20px;
              background:${s.color}22;color:${s.color};font-weight:700;">${zone.risk}</span>
          </div>
          <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">${zone.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:8px;">${zone.desc}</div>
          <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px;
            display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Est. Depth</div>
              <div style="font-size:13px;font-weight:700;color:${s.color};">${zone.depth}</div>
            </div>
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Status</div>
              <div style="font-size:13px;font-weight:700;color:${s.color};">ACTIVE</div>
            </div>
          </div>
        </div>
      `;

      const label = L.marker(center, { icon: labelIcon, interactive: true })
        .bindPopup(popup)
        .addTo(map);
      poly.bindPopup(popup);

      layers.push(poly, glowPoly, label);
    });

    layersRef.current = layers;
    return () => {
      layers.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
      layersRef.current = [];
    };
  }, [map, regionData]);

  return null;
}
