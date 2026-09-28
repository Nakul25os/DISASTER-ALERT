import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { DEFAULT_SHELTERS } from "../../../data/sheltersData";

export default function ShelterMarkers({ shelters = [] }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Clean up previous cluster group
    if (clusterRef.current) {
      try {
        map.removeLayer(clusterRef.current);
      } catch (_) {}
      clusterRef.current = null;
    }

    // Merge backend shelters with master nationwide default shelters
    const combinedMap = new Map();

    // 1. Add baseline shelters across all Indian states
    DEFAULT_SHELTERS.forEach((s) => {
      combinedMap.set(s.id || `${s.latitude.toFixed(3)}_${s.longitude.toFixed(3)}`, s);
    });

    // 2. Merge / override with backend shelters
    if (Array.isArray(shelters) && shelters.length > 0) {
      shelters.forEach((s) => {
        const key = s.id || `${s.latitude?.toFixed(3)}_${s.longitude?.toFixed(3)}`;
        combinedMap.set(key, { ...combinedMap.get(key), ...s, status: s.status || "ACTIVE" });
      });
    }

    const allShelters = Array.from(combinedMap.values());

    // Create high-visibility cluster group that unclusters cleanly
    const clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 9,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              min-width: 44px;
              height: 44px;
              padding: 0 10px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
              border: 2.5px solid #38bdf8;
              box-shadow: 0 0 20px rgba(56, 189, 248, 0.8), 0 4px 12px rgba(0,0,0,0.6);
              color: #ffffff;
              font-family: Inter, sans-serif;
              font-weight: 800;
              font-size: 13px;
              cursor: pointer;
            ">
              <span style="font-size: 14px;">🛡️</span>
              <span>${count}</span>
            </div>
          `,
          className: "custom-shelter-cluster",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
      },
    });

    allShelters.forEach((s) => {
      if (!s.latitude || !s.longitude) return;

      const beds = Number(s.availableBeds ?? s.capacity ?? 250);
      const total = Number(s.capacity ?? 300);
      const pct = Math.min(100, Math.round((beds / (total || 1)) * 100));

      const isHighCapacity = beds > 100;
      const themeColor = isHighCapacity ? "#38bdf8" : beds > 0 ? "#fbbf24" : "#ef4444";
      const badgeGlow = isHighCapacity ? "rgba(56, 189, 248, 0.6)" : "rgba(251, 191, 36, 0.6)";

      // Prominent glowing emergency shelter icon
      const icon = L.divIcon({
        className: "bg-transparent border-0",
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">
            <!-- Pulsing outer aura ring -->
            <div style="
              position: absolute;
              top: 10px;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.35);
              box-shadow: 0 0 16px ${badgeGlow};
              pointer-events: none;
            "></div>

            <!-- Shield Beacon Marker -->
            <div style="
              position: relative;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 36px;
              border-radius: 12px;
              background: linear-gradient(135deg, #0369a1 0%, #0f172a 100%);
              border: 2px solid ${themeColor};
              box-shadow: 0 0 15px ${badgeGlow}, 0 4px 10px rgba(0,0,0,0.7);
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 18px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🛡️</span>
            </div>

            <!-- Pointer Pin Tip -->
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid ${themeColor};
              margin-top: -1px;
            "></div>

            <!-- Bottom Floating Capacity Pill -->
            <div style="
              margin-top: 2px;
              display: flex;
              align-items: center;
              gap: 4px;
              background: rgba(10, 15, 29, 0.94);
              border: 1px solid ${themeColor}88;
              border-radius: 9999px;
              padding: 2px 7px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.7);
              white-space: nowrap;
            ">
              <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;"></span>
              <span style="font-family:Inter,sans-serif;font-size:10px;font-weight:800;color:#f8fafc;letter-spacing:0.02em;">
                ${beds} Beds
              </span>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const facilitiesList = s.facilities || [
        s.foodAvailable ? "Hot Meals" : null,
        s.medicalAvailable ? "Medical Unit" : null,
        "Clean Water",
        "Backup Power",
      ].filter(Boolean);

      const popupContent = `
        <div style="background:#090e1c;color:#fff;padding:16px;border-radius:14px;border:1px solid #38bdf855;min-width:270px;max-width:320px;font-family:Inter,sans-serif;box-shadow:0 12px 35px rgba(0,0,0,0.85);">
          <!-- Top Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:16px;">🛡️</span>
              <span style="font-size:10px;letter-spacing:0.1em;color:#38bdf8;font-weight:800;text-transform:uppercase;">
                VERIFIED RELIEF SHELTER
              </span>
            </div>
            <span style="font-size:9px;padding:2px 8px;border-radius:9999px;background:#22c55e22;border:1px solid #22c55e;color:#4ade80;font-weight:700;">
              ● ${s.status || "ACTIVE"}
            </span>
          </div>

          <!-- Shelter Title & Org -->
          <div style="font-size:15px;font-weight:800;color:#ffffff;line-height:1.3;margin-bottom:3px;">
            ${s.name}
          </div>
          <div style="font-size:11px;color:#94a3b8;font-weight:500;margin-bottom:12px;">
            ${s.organisation || s.city || "Civil Disaster Response Authority"}
          </div>

          <!-- Capacity Bar -->
          <div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:10px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;color:#cbd5e1;font-weight:600;">Available Bed Capacity</span>
              <span style="font-size:12px;font-weight:800;color:#38bdf8;">${beds} / ${total} (${pct}%)</span>
            </div>
            <div style="width:100%;height:6px;background:rgba(255,255,255,0.15);border-radius:9999px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg, #38bdf8, #22c55e);border-radius:9999px;"></div>
            </div>
          </div>

          <!-- Supplies & Facilities -->
          <div style="margin-bottom:12px;">
            <div style="font-size:10px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:6px;letter-spacing:0.05em;">
              Supply Readiness & On-Site Facilities
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${facilitiesList
                .map(
                  (f) => `
                <span style="font-size:10px;background:rgba(14,165,233,0.15);border:1px solid rgba(56,189,248,0.3);color:#bae6fd;padding:2px 7px;border-radius:6px;font-weight:600;">
                  ✓ ${f}
                </span>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- Emergency Contact & Location -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);font-size:11px;">
            <div>
              <div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:700;">24/7 Helpline</div>
              <a href="tel:${s.contactDetails || "+911800123456"}" style="color:#38bdf8;font-weight:700;text-decoration:none;">
                📞 ${s.contactDetails || "1077 (Disaster Toll-Free)"}
              </a>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:700;">Location</div>
              <span style="color:#e2e8f0;font-weight:600;">${s.city || "Target Zone"}</span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([s.latitude, s.longitude], { icon })
        .bindPopup(popupContent);

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterRef.current = clusterGroup;

    return () => {
      if (clusterRef.current) {
        try {
          map.removeLayer(clusterRef.current);
        } catch (_) {}
        clusterRef.current = null;
      }
    };
  }, [shelters, map]);

  return null;
}
