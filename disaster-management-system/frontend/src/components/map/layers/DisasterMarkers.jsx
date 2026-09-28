import React from "react";
import { Marker, Tooltip, Circle, Popup } from "react-leaflet";
import L from "leaflet";

// Helper to generate distinct professional GIS disaster map icons
const createDisasterIcon = (disasterType, event = {}) => {
  const type = (disasterType || "").toUpperCase();
  const isSachet = event.source === "SACHET_NDMA";
  let color = "#ef4444";
  let pulseClass = "bg-red-500";
  let svgIcon = "";

  if (type.includes("FLOOD") || type.includes("RAIN")) {
    color = "#00f0ff";
    pulseClass = "bg-cyan-500";
    svgIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 11c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"/>
        <path d="M2 16c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"/>
      </svg>
    `;
  } else if (type.includes("QUAKE") || type.includes("EARTHQUAKE") || type.includes("SEISMIC")) {
    color = "#ef4444";
    pulseClass = "bg-red-500";
    svgIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="2 12 5 12 7 5 11 19 14 9 17 14 19 12 22 12"/>
      </svg>
    `;
  } else if (type.includes("CYCLONE") || type.includes("STORM")) {
    color = "#06b6d4";
    pulseClass = "bg-teal-400";
    svgIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a10 10 0 0 1 7.07 17.07M12 22A10 10 0 0 1 4.93 4.93"/>
        <circle cx="12" cy="12" r="3" fill="${color}" fill-opacity="0.35"/>
      </svg>
    `;
  } else if (type.includes("LANDSLIDE") || type.includes("SLOPE")) {
    color = "#f59e0b";
    pulseClass = "bg-amber-500";
    svgIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 20h18L13 4 8 13l-3-2-2 5z"/>
        <line x1="13" y1="12" x2="17" y2="16" stroke-width="2"/>
      </svg>
    `;
  } else {
    svgIcon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    `;
  }

  // SACHET marker gets a teal government shield badge in the corner
  const sachetBadge = isSachet
    ? `<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#0d9488;border:1.5px solid #5eead4;display:flex;align-items:center;justify-content:center;z-index:10;">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
        </svg>
      </div>`
    : "";

  return L.divIcon({
    className: "disaster-marker-pin bg-transparent border-0",
    html: `
      <div 
        class="relative w-12 h-12 flex items-center justify-center cursor-pointer group" 
        data-disaster-id="${event.id || ''}"
        style="pointer-events: auto;"
        title="${event.title || 'Disaster Event'} — ${isSachet ? 'NDMA Official Alert' : 'Click to inspect Satellite Assessment & Heatmap'}"
      >
        <!-- Outer pulsing aura -->
        <div class="absolute inset-0 ${pulseClass} rounded-full opacity-35 animate-ping pointer-events-none"></div>
        <div class="absolute -inset-1 ${pulseClass} rounded-full opacity-20 blur-sm pointer-events-none"></div>
        <!-- Inner Core Spot -->
        <div class="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg pointer-events-none"
          style="background:rgba(2,6,20,0.95);border:2px solid ${isSachet ? '#5eead4' : color};box-shadow:0 0 18px ${color}aa;">
          ${svgIcon}
        </div>
        ${sachetBadge}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -26],
  });
};

// Compact rich popup for SACHET markers
function SachetPopup({ event }) {
  const sevColor =
    event.officialSeverity === "HIGH"
      ? "#ef4444"
      : event.officialSeverity === "MEDIUM"
      ? "#f59e0b"
      : "#64748b";
  return (
    <div style={{ fontFamily: "Inter,sans-serif", minWidth: 220, maxWidth: 280, padding: "4px 2px" }}>
      {/* NDMA badge header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{ background: "#0d9488", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/></svg>
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", color: "#0d9488", textTransform: "uppercase" }}>NDMA OFFICIAL ALERT</span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", marginBottom: 4, lineHeight: 1.35 }}>
        {event.title || event.message || "SACHET NDMA Alert"}
      </div>

      {/* Type + Severity row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ background: "#e0f2fe", color: "#0284c7", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
          {event.disasterType}
        </span>
        {event.officialSeverity && (
          <span style={{ background: sevColor + "22", color: sevColor, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, border: `1px solid ${sevColor}55` }}>
            {event.officialSeverity}
          </span>
        )}
      </div>

      {/* Description */}
      {event.message && event.message !== event.title && (
        <div style={{ fontSize: 11, color: "#475569", marginBottom: 5, lineHeight: 1.45 }}>
          {event.message.slice(0, 160)}{event.message.length > 160 ? "…" : ""}
        </div>
      )}

      {/* State */}
      {event.state && (
        <div style={{ fontSize: 11, color: "#334155", marginBottom: 3 }}>
          <strong>State:</strong> {event.state}, India
        </div>
      )}

      {/* Published */}
      {event.timestamp && (
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 5 }}>
          <strong>Published:</strong> {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </div>
      )}

      {/* Source link */}
      {event.sourceUrl && (
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10, color: "#0d9488", textDecoration: "underline", display: "block" }}
        >
          View on SACHET NDMA →
        </a>
      )}
    </div>
  );
}

export default function DisasterMarkers({ events = [], onSelectDisaster }) {
  const validEvents = events.filter(
    (e) => e && e.latitude && e.longitude && e.disasterType !== "SOS" && e.source !== "SACHET_NDMA"
  );

  // Global capture click handler for disaster pins to guarantee clickability regardless of Leaflet DOM layering
  React.useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('[data-disaster-id]');
      if (target) {
        const id = target.getAttribute('data-disaster-id');
        const matched = validEvents.find((ev) => ev.id === id);
        if (matched && onSelectDisaster) {
          // Don't open heatmap for SACHET markers — they have their own Popup
          if (matched.source === "SACHET_NDMA") return;
          e.preventDefault();
          e.stopPropagation();
          onSelectDisaster(matched);
        }
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [validEvents, onSelectDisaster]);

  return (
    <>
      {validEvents.map((event) => {
        const isSachet = event.source === "SACHET_NDMA";
        const icon = createDisasterIcon(event.disasterType, event);
        const radius = (event.affectedRadius ? event.affectedRadius * 1000 : 8000);
        const typeStr = (event.disasterType || "").toUpperCase();
        let circleColor = "#ef4444";
        if (typeStr.includes("FLOOD")) circleColor = "#00f0ff";
        else if (typeStr.includes("LANDSLIDE")) circleColor = "#f59e0b";
        else if (typeStr.includes("CYCLONE")) circleColor = "#06b6d4";
        else if (isSachet) circleColor = "#14b8a6";

        return (
          <React.Fragment key={event.id || `${event.latitude}-${event.longitude}`}>
            {/* Impact radius circle */}
            <Circle
              center={[event.latitude, event.longitude]}
              radius={radius}
              interactive={!isSachet}
              eventHandlers={
                !isSachet
                  ? {
                      click: (e) => {
                        if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                        if (onSelectDisaster) onSelectDisaster(event);
                      },
                    }
                  : {}
              }
              pathOptions={{
                color: circleColor,
                fillColor: circleColor,
                fillOpacity: isSachet ? 0.07 : 0.12,
                weight: isSachet ? 1.5 : 2,
                dashArray: isSachet ? "4, 8" : "6, 6",
                interactive: !isSachet,
              }}
            >
              {!isSachet && (
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="p-1 text-slate-900 font-sans max-w-[240px]">
                    <div className="font-bold text-xs leading-tight text-slate-950">{event.title || "Disaster Event"}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{event.location || ""}</div>
                    <div className="text-[10px] text-cyan-700 font-semibold mt-1 flex items-center gap-1 font-mono uppercase tracking-wide">
                      <span>Click to Inspect Satellite Analysis & Heatmap</span>
                    </div>
                  </div>
                </Tooltip>
              )}
            </Circle>

            {/* Marker */}
            <Marker
              position={[event.latitude, event.longitude]}
              icon={icon}
              interactive={true}
              zIndexOffset={isSachet ? 2500 : 2000}
              eventHandlers={
                !isSachet
                  ? {
                      click: (e) => {
                        if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                        if (onSelectDisaster) onSelectDisaster(event);
                      },
                    }
                  : {}
              }
            >
              {isSachet ? (
                // SACHET markers use Leaflet Popup with rich NDMA content
                <Popup
                  maxWidth={300}
                  className="sachet-popup"
                  closeButton={true}
                >
                  <SachetPopup event={event} />
                </Popup>
              ) : (
                <Tooltip direction="top" offset={[0, -28]} opacity={0.95}>
                  <div
                    className="p-1 text-slate-900 font-sans max-w-[240px] cursor-pointer"
                    onClick={() => onSelectDisaster && onSelectDisaster(event)}
                  >
                    <div className="font-bold text-xs leading-tight text-slate-950">{event.title || "Disaster Event"}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{event.location || ""}</div>
                    <div className="text-[10px] text-cyan-700 font-semibold mt-1 flex items-center gap-1 font-mono uppercase tracking-wide">
                      <span>Click to Inspect Satellite Analysis & Heatmap</span>
                    </div>
                  </div>
                </Tooltip>
              )}
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}
