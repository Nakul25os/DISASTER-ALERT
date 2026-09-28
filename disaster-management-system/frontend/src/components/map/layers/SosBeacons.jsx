import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const SEVERITY_STYLE = {
  CRITICAL: { outer: "#ff2d55", inner: "#ff6b84", glow: "rgba(255,45,85,0.9)", size: 52, innerSize: 18 },
  HIGH:     { outer: "#ff6a00", inner: "#ff9f4a", glow: "rgba(255,106,0,0.8)", size: 44, innerSize: 15 },
  MEDIUM:   { outer: "#fbbf24", inner: "#fde68a", glow: "rgba(251,191,36,0.7)", size: 38, innerSize: 13 },
};

function buildSosIcon(severity, idx) {
  const s = SEVERITY_STYLE[severity] || SEVERITY_STYLE.MEDIUM;
  const delay = (idx * 0.4).toFixed(1);
  return L.divIcon({
    className: "bg-transparent border-0",
    html: `
      <div style="position:relative;width:${s.size}px;height:${s.size}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:50%;
          border:2px solid ${s.outer};
          animation:sosPulse1 1.6s ease-out ${delay}s infinite;
          opacity:0.8;"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;
          border:1.5px solid ${s.outer};
          animation:sosPulse2 1.6s ease-out ${(parseFloat(delay)+0.4).toFixed(1)}s infinite;
          opacity:0.5;"></div>
        <div style="position:relative;
          width:${s.innerSize}px;height:${s.innerSize}px;
          background:radial-gradient(circle,${s.inner},${s.outer});
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 0 16px ${s.glow}, 0 0 30px ${s.glow};
          animation:sosCore 0.8s ease-in-out ${delay}s infinite alternate;
        "></div>
        <div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
          font-size:9px;font-weight:900;color:${s.inner};
          letter-spacing:0.15em;text-shadow:0 0 8px ${s.glow};
          font-family:Inter,sans-serif;white-space:nowrap;">SOS</div>
      </div>
    `,
    iconSize: [s.size, s.size],
    iconAnchor: [s.size / 2, s.size / 2],
  });
}

export default function SosBeacons({ regionData, events = [] }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Cleanup previous region's beacons
    layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
    layersRef.current = [];

    // Use real backend events first; fall back to region synthetic beacons
    const realSos = events.filter((e) => e.latitude && e.longitude);
    const beacons = realSos.length > 0
      ? realSos.map((e) => ({
          id: e.id,
          lat: e.latitude, lng: e.longitude,
          msg: e.message || "Emergency SOS active",
          severity: e.severity >= 8 ? "CRITICAL" : e.severity >= 5 ? "HIGH" : "MEDIUM",
          time: "Live",
        }))
      : (regionData?.sos || []);

    const layers = [];
    beacons.forEach((beacon, i) => {
      const icon = buildSosIcon(beacon.severity, i);
      const s = SEVERITY_STYLE[beacon.severity] || SEVERITY_STYLE.MEDIUM;

      const marker = L.marker([beacon.lat, beacon.lng], { icon, zIndexOffset: 1000 })
        .bindPopup(`
          <div style="background:rgba(5,5,15,0.97);color:#fff;padding:12px 14px;border-radius:12px;
            border:1px solid ${s.outer}55;min-width:210px;font-family:Inter,sans-serif;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:900;color:${s.inner};letter-spacing:0.12em;">EMERGENCY SOS BEACON</span>
              <span style="font-size:9px;padding:2px 8px;border-radius:20px;
                background:${s.outer}33;color:${s.inner};font-weight:700;">${beacon.severity}</span>
            </div>
            <div style="font-size:12px;color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:8px;">${beacon.msg}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:9px;color:rgba(255,255,255,0.35);">Reported: ${beacon.time}</div>
              <div style="font-size:9px;padding:2px 8px;border-radius:10px;
                background:rgba(255,45,85,0.15);color:#ff6b84;">AWAITING RESCUE</div>
            </div>
          </div>
        `)
        .addTo(map);
      layers.push(marker);
    });

    layersRef.current = layers;
    return () => {
      layers.forEach((l) => { try { map.removeLayer(l); } catch (_) {} });
      layersRef.current = [];
    };
  }, [map, regionData, events]);

  // Inject CSS keyframes once
  useEffect(() => {
    const styleId = "sos-keyframes";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes sosPulse1 {
        0%   { transform:scale(0.85); opacity:0.8; }
        70%  { transform:scale(1.1);  opacity:0; }
        100% { transform:scale(0.85); opacity:0; }
      }
      @keyframes sosPulse2 {
        0%   { transform:scale(0.9); opacity:0.5; }
        70%  { transform:scale(1.15); opacity:0; }
        100% { transform:scale(0.9); opacity:0; }
      }
      @keyframes sosCore {
        from { transform:scale(0.92); }
        to   { transform:scale(1.08); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}
