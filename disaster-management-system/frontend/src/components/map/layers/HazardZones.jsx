import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Custom inline CSS to inject for animations
const HAZARD_STYLE = `
  @keyframes seismic-wave {
    0% { transform: scale(0.1); opacity: 0; border-width: 3px; }
    10% { opacity: 0.85; }
    50% { opacity: 0.5; }
    100% { transform: scale(1.8); opacity: 0; border-width: 1px; }
  }
  @keyframes cyclone-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes track-flow {
    from { stroke-dashoffset: 40; }
    to { stroke-dashoffset: 0; }
  }
  .seismic-ring {
    position: absolute;
    inset: -60px;
    border: 2px solid #ef4444;
    border-radius: 50%;
    animation: seismic-wave 3.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
  }
  .seismic-ring-2 { animation-delay: 1.0s; }
  .seismic-ring-3 { animation-delay: 2.0s; }

  .cyclone-spinner {
    animation: cyclone-spin 4s linear infinite;
    filter: drop-shadow(0 0 8px rgba(6,182,212,0.6));
  }
  .flow-track {
    stroke-dasharray: 10 7;
    animation: track-flow 1.5s linear infinite;
  }
`;

export default function HazardZones({ regionData }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Inject stylesheet if not already present
    let styleTag = document.getElementById("leaflet-hazard-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "leaflet-hazard-style";
      styleTag.innerHTML = HAZARD_STYLE;
      document.head.appendChild(styleTag);
    }

    // Cleanup previous layers
    layersRef.current.forEach((l) => {
      try { map.removeLayer(l); } catch (_) {}
    });
    layersRef.current = [];

    const hazards = regionData?.hazardZones || [];
    const layers = [];

    hazards.forEach((hazard, idx) => {
      const uniqueId = `hazard-${regionData.id}-${idx}`;

      if (hazard.type === "EARTHQUAKE") {
        const sColor = "#ef4444"; // Red for earthquake
        const centerCoords = [hazard.center.lat, hazard.center.lng];

        // 1. Concentric pulsing waves icon
        const seismicIcon = L.divIcon({
          className: "bg-transparent border-0",
          html: `
            <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
              <!-- Epicenter Solid Core -->
              <div class="relative w-4 h-4 rounded-full bg-red-500 border border-white flex items-center justify-center z-10 shadow-[0_0_12px_rgba(239,68,68,1)]">
                <div class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
              </div>
              <!-- Concentric waves -->
              <div class="seismic-ring"></div>
              <div class="seismic-ring seismic-ring-2"></div>
              <div class="seismic-ring seismic-ring-3"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // 2. Translucent intensity boundary circle
        const radiusCircle = L.circle(centerCoords, {
          radius: hazard.radius,
          color: sColor,
          fillColor: sColor,
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: "6 6",
          opacity: 0.6,
          interactive: false,
        }).addTo(map);

        // 3. Info Popup Content
        const popupContent = `
          <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${sColor}55;min-width:240px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;letter-spacing:0.1em;color:${sColor};font-weight:700;text-transform:uppercase;">
                SEISMIC EPICENTER
              </span>
              <span style="font-size:9px;padding:2px 8px;border-radius:20px;
                background:${sColor}22;color:${sColor};font-weight:700;">Zone V</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">${hazard.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:8px;">${hazard.desc}</div>
            <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px;
              display:grid;grid-template-columns:1fr 1fr;gap:4px;">
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Magnitude</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.magnitude}</div>
              </div>
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Focus Depth</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.depth}</div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker(centerCoords, { icon: seismicIcon })
          .bindPopup(popupContent)
          .addTo(map);

        layers.push(radiusCircle, marker);
      }

      else if (hazard.type === "CYCLONE") {
        const sColor = "#06b6d4"; // Cyan for cyclone/wind
        const centerCoords = [hazard.center.lat, hazard.center.lng];

        // 1. Spinning cyclone svg icon
        const cycloneIcon = L.divIcon({
          className: "bg-transparent border-0",
          html: `
            <div class="cyclone-spinner" style="width: 42px; height: 42px;">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <circle cx="50" cy="50" r="8" fill="${sColor}" />
                <path d="M50 15C30 15 15 30 15 50C15 65 30 75 40 80C35 70 35 55 50 50C65 45 75 40 80 30C70 35 55 35 50 15Z" fill="${sColor}" opacity="0.8"/>
                <path d="M50 85C70 85 85 70 85 50C85 35 70 25 60 20C65 30 65 45 50 50C35 55 25 60 20 70C30 65 45 65 50 85Z" fill="${sColor}" opacity="0.8"/>
              </svg>
            </div>
          `,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        // 2. Wind radius circle
        const radiusCircle = L.circle(centerCoords, {
          radius: hazard.radius,
          color: sColor,
          fillColor: sColor,
          fillOpacity: 0.04,
          weight: 1.5,
          dashArray: "10 5",
          opacity: 0.6,
          interactive: false,
        }).addTo(map);

        // 3. Flowing storm track path
        const trackPath = L.polyline(hazard.path, {
          color: sColor,
          weight: 2.5,
          opacity: 0.75,
          className: "flow-track",
          interactive: false,
        }).addTo(map);

        // 4. Info Popup
        const popupContent = `
          <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${sColor}55;min-width:240px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;letter-spacing:0.1em;color:${sColor};font-weight:700;text-transform:uppercase;">
                CYCLONIC STORM SYSTEM
              </span>
              <span style="font-size:9px;padding:2px 8px;border-radius:20px;
                background:${sColor}22;color:${sColor};font-weight:700;">Active</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">${hazard.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:8px;">${hazard.desc}</div>
            <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px;
              display:grid;grid-template-columns:1fr 1fr;gap:4px;">
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Sustained Wind</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.speed}</div>
              </div>
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Surge Height</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.waveHeight}</div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker(centerCoords, { icon: cycloneIcon })
          .bindPopup(popupContent)
          .addTo(map);

        layers.push(radiusCircle, trackPath, marker);
      }

      else if (hazard.type === "LANDSLIDE") {
        const sColor = "#f97316"; // Orange for landslide
        const slideCoords = hazard.coords;

        // 1. Shaded polygon boundary
        const poly = L.polygon(slideCoords, {
          color: sColor,
          fillColor: sColor,
          fillOpacity: 0.18,
          weight: 2,
          opacity: 0.85,
          dashArray: "4 4",
        }).addTo(map);

        // 2. Glow outer border
        const glowPoly = L.polygon(slideCoords, {
          color: sColor,
          fillOpacity: 0,
          weight: 6,
          opacity: 0.12,
          interactive: false,
        }).addTo(map);

        // Centroid for label marker
        const center = poly.getBounds().getCenter();

        const slideIcon = L.divIcon({
          className: "bg-transparent border-0",
          html: `
            <div style="
              background:rgba(15,10,5,0.92);
              border:1px solid ${sColor}88;
              border-radius:6px;padding:3px 7px;
              white-space:nowrap;font-family:Inter,sans-serif;
              font-size:9px;font-weight:700;color:${sColor};
              letter-spacing:0.08em;text-transform:uppercase;
              box-shadow:0 0 10px rgba(249,115,22,0.3);
            ">SLIDE RISK: ${hazard.hazardIndex}</div>
          `,
          iconAnchor: [0, 0],
        });

        // 3. Info Popup
        const popupContent = `
          <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${sColor}55;min-width:230px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;letter-spacing:0.1em;color:${sColor};font-weight:700;text-transform:uppercase;">
                SLOPE FAILURE HAZARD
              </span>
              <span style="font-size:9px;padding:2px 8px;border-radius:20px;
                background:${sColor}22;color:${sColor};font-weight:700;">CRITICAL</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">${hazard.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:8px;">${hazard.desc}</div>
            <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px;
              display:grid;grid-template-columns:1fr;gap:4px;">
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Slope Stability Index</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.hazardIndex} (Critical Risk)</div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker(center, { icon: slideIcon })
          .bindPopup(popupContent)
          .addTo(map);

        poly.bindPopup(popupContent);

        layers.push(poly, glowPoly, marker);
      }

      else if (hazard.type === "DROUGHT") {
        const sColor = "#eab308"; // Yellow for drought
        const dryCoords = hazard.coords;

        // 1. Shaded polygon boundary
        const poly = L.polygon(dryCoords, {
          color: sColor,
          fillColor: sColor,
          fillOpacity: 0.14,
          weight: 1.5,
          opacity: 0.75,
          dashArray: "10 5",
        }).addTo(map);

        // Centroid for label
        const center = poly.getBounds().getCenter();

        const dryIcon = L.divIcon({
          className: "bg-transparent border-0",
          html: `
            <div style="
              background:rgba(15,15,5,0.92);
              border:1px solid ${sColor}88;
              border-radius:6px;padding:3px 7px;
              white-space:nowrap;font-family:Inter,sans-serif;
              font-size:9px;font-weight:700;color:${sColor};
              letter-spacing:0.08em;text-transform:uppercase;
              box-shadow:0 0 10px rgba(234,179,8,0.25);
            ">DROUGHT DEFICIT: ${hazard.moistureDeficit}</div>
          `,
          iconAnchor: [0, 0],
        });

        // 2. Info Popup
        const popupContent = `
          <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${sColor}55;min-width:240px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;letter-spacing:0.1em;color:${sColor};font-weight:700;text-transform:uppercase;">
                DROUGHT & ARIDITY DEFICIT
              </span>
              <span style="font-size:9px;padding:2px 8px;border-radius:20px;
                background:${sColor}22;color:${sColor};font-weight:700;">Severe</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.95);margin-bottom:6px;">${hazard.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5;margin-bottom:8px;">${hazard.desc}</div>
            <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:8px;
              display:grid;grid-template-columns:1fr;gap:4px;">
              <div>
                <div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;">Moisture Deficit</div>
                <div style="font-size:13px;font-weight:700;color:${sColor};">${hazard.moistureDeficit}</div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker(center, { icon: dryIcon })
          .bindPopup(popupContent)
          .addTo(map);

        poly.bindPopup(popupContent);

        layers.push(poly, marker);
      }
    });

    layersRef.current = layers;

    return () => {
      layers.forEach((l) => {
        try { map.removeLayer(l); } catch (_) {}
      });
      layersRef.current = [];
    };
  }, [map, regionData]);

  return null;
}
