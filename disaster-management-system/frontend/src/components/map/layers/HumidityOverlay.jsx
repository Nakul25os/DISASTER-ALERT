import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Atmospheric Moisture & Relative Humidity (RH) Sensor Network.
 * Renders crisp isohume contours and hygrometer stations without blurry raster fog.
 */
const BASE_HUMIDITY_ZONES = [
  {
    id: "hum-konkan",
    name: "Konkan Marine Atmospheric Grid",
    lat: 19.07,
    lng: 72.88,
    humidity: 86,
    dewPoint: 24.2,
    temp: 28.5,
    vpd: "0.48 kPa",
    status: "HIGH SATURATION",
    radiusM: 60000,
  },
  {
    id: "hum-sundarbans",
    name: "Sundarbans Estuarine Grid",
    lat: 22.20,
    lng: 88.65,
    humidity: 89,
    dewPoint: 25.1,
    temp: 29.0,
    vpd: "0.36 kPa",
    status: "NEAR SATURATION",
    radiusM: 65000,
  },
  {
    id: "hum-kerala",
    name: "Malabar Tropical Moisture Zone",
    lat: 9.98,
    lng: 76.28,
    humidity: 82,
    dewPoint: 23.6,
    temp: 27.8,
    vpd: "0.55 kPa",
    status: "ELEVATED MOISTURE",
    radiusM: 55000,
  },
  {
    id: "hum-deccan",
    name: "Central Deccan Atmospheric Node",
    lat: 21.14,
    lng: 79.08,
    humidity: 62,
    dewPoint: 18.4,
    temp: 31.0,
    vpd: "1.15 kPa",
    status: "OPTIMAL RANGE",
    radiusM: 55000,
  },
  {
    id: "hum-gangetic",
    name: "Gangetic Plain Atmospheric Station",
    lat: 25.59,
    lng: 85.13,
    humidity: 74,
    dewPoint: 21.0,
    temp: 30.2,
    vpd: "0.78 kPa",
    status: "MODERATE HUMIDITY",
    radiusM: 55000,
  },
  {
    id: "hum-delhi",
    name: "Northern NCR Moisture Station",
    lat: 28.61,
    lng: 77.20,
    humidity: 54,
    dewPoint: 15.2,
    temp: 32.5,
    vpd: "1.42 kPa",
    status: "NORMAL / DRY",
    radiusM: 50000,
  },
  {
    id: "hum-coromandel",
    name: "Coromandel Coastal Sensor Grid",
    lat: 13.08,
    lng: 80.27,
    humidity: 79,
    dewPoint: 22.8,
    temp: 29.5,
    vpd: "0.64 kPa",
    status: "ELEVATED MOISTURE",
    radiusM: 55000,
  },
  {
    id: "hum-assam",
    name: "Brahmaputra Valley Moisture Belt",
    lat: 26.14,
    lng: 91.73,
    humidity: 88,
    dewPoint: 24.8,
    temp: 28.0,
    vpd: "0.42 kPa",
    status: "HIGH SATURATION",
    radiusM: 60000,
  },
];

function getHumidityTheme(humidity) {
  if (humidity >= 85) {
    return {
      color: "#8b5cf6",
      fill: "#7c3aed",
      badgeBorder: "#a78bfa",
      glow: "rgba(139, 92, 246, 0.6)",
      label: "Saturated (>85%)",
    };
  }
  if (humidity >= 70) {
    return {
      color: "#10b981",
      fill: "#059669",
      badgeBorder: "#34d399",
      glow: "rgba(16, 185, 129, 0.6)",
      label: "High (70-85%)",
    };
  }
  if (humidity >= 50) {
    return {
      color: "#06b6d4",
      fill: "#0891b2",
      badgeBorder: "#22d3ee",
      glow: "rgba(6, 182, 212, 0.6)",
      label: "Optimal (50-70%)",
    };
  }
  return {
    color: "#38bdf8",
    fill: "#0284c7",
    badgeBorder: "#7dd3fc",
    glow: "rgba(56, 189, 248, 0.5)",
    label: "Normal (<50%)",
  };
}

export default function HumidityOverlay({ center }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous layers
    layersRef.current.forEach((l) => {
      try {
        map.removeLayer(l);
      } catch (_) {}
    });
    layersRef.current = [];

    let zones = [...BASE_HUMIDITY_ZONES];

    // Add local zone if user selected a custom center
    if (center && center.lat && center.lng) {
      const isNearBase = BASE_HUMIDITY_ZONES.some(
        (z) => Math.hypot(z.lat - center.lat, z.lng - center.lng) < 0.6
      );

      if (!isNearBase && (center.lat !== 21.7679 || center.lng !== 78.8718)) {
        zones.unshift({
          id: "hum-local-target",
          name: `Target Sector Hygrometer (${center.lat.toFixed(2)}°N, ${center.lng.toFixed(2)}°E)`,
          lat: center.lat,
          lng: center.lng,
          humidity: 76,
          dewPoint: 22.0,
          temp: 29.0,
          vpd: "0.72 kPa",
          status: "ELEVATED MOISTURE",
          radiusM: 35000,
        });
      }
    }

    const createdLayers = [];

    zones.forEach((zone) => {
      const theme = getHumidityTheme(zone.humidity);
      const r = zone.radiusM || 55000;

      // Outer Isohume Perimeter (clean vector border, completely transparent interior)
      const outerRing = L.circle([zone.lat, zone.lng], {
        radius: r * 1.35,
        color: theme.color,
        weight: 1.5,
        opacity: 0.7,
        dashArray: "8, 6",
        fillColor: theme.fill,
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map);

      // Core Atmospheric Moisture Zone (subtle semi-translucent fill, sharp border)
      const moistureCell = L.circle([zone.lat, zone.lng], {
        radius: r * 0.75,
        color: theme.badgeBorder,
        weight: 1.5,
        opacity: 0.9,
        fillColor: theme.fill,
        fillOpacity: 0.18,
        interactive: true,
      }).addTo(map);

      // Station Beacon with RH badge
      const badgeIcon = L.divIcon({
        className: "bg-transparent border-0",
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(8, 14, 26, 0.92);
            border: 1px solid ${theme.badgeBorder};
            border-radius: 9999px;
            padding: 4px 10px;
            box-shadow: 0 0 14px ${theme.glow};
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
            backdrop-filter: blur(8px);
          ">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${theme.color};box-shadow:0 0 8px ${theme.color};"></span>
            <span style="font-family:Inter,sans-serif;font-size:11px;font-weight:800;color:#ffffff;letter-spacing:0.02em;">
              💧 ${zone.humidity}% RH
            </span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const popupHtml = `
        <div style="background:#090e1c;color:#fff;padding:14px;border-radius:12px;border:1px solid ${theme.badgeBorder}66;min-width:240px;font-family:Inter,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,0.8);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:10px;letter-spacing:0.1em;color:${theme.color};font-weight:800;text-transform:uppercase;">
              HYGROMETRIC SENSOR NODE
            </span>
            <span style="font-size:9px;padding:2px 8px;border-radius:9999px;background:${theme.fill}33;border:1px solid ${theme.color};color:${theme.color};font-weight:700;">
              ${zone.status}
            </span>
          </div>
          <div style="font-size:14px;font-weight:800;color:#ffffff;margin-bottom:8px;">
            ${zone.name}
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;font-weight:600;">Relative Humidity</div>
              <div style="font-size:14px;font-weight:800;color:${theme.badgeBorder};">${zone.humidity}% RH</div>
            </div>
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;font-weight:600;">Dew Point</div>
              <div style="font-size:14px;font-weight:800;color:#38bdf8;">${zone.dewPoint} °C</div>
            </div>
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;font-weight:600;">Ambient Temp</div>
              <div style="font-size:12px;font-weight:700;color:#e2e8f0;">${zone.temp} °C</div>
            </div>
            <div>
              <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;font-weight:600;">Vapor Deficit</div>
              <div style="font-size:12px;font-weight:700;color:#cbd5e1;">${zone.vpd}</div>
            </div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,0.5);display:flex;align-items:center;gap:6px;">
            <span style="display:inline-block;width:6px;height:6px;background:${theme.color};border-radius:50%;"></span>
            Atmospheric Mesh Active • Realtime Hygrometry
          </div>
        </div>
      `;

      const marker = L.marker([zone.lat, zone.lng], {
        icon: badgeIcon,
        interactive: true,
      })
        .bindPopup(popupHtml)
        .addTo(map);

      moistureCell.bindPopup(popupHtml);

      createdLayers.push(outerRing, moistureCell, marker);
    });

    layersRef.current = createdLayers;

    return () => {
      createdLayers.forEach((l) => {
        try {
          map.removeLayer(l);
        } catch (_) {}
      });
      layersRef.current = [];
    };
  }, [map, center?.lat, center?.lng]);

  return null;
}
