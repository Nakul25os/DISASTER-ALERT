import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useMemo } from "react";

import { REGIONS, DEFAULT_REGION_ID } from "../../data/regionsData";

// Panels
import CommandHeader from "./panels/CommandHeader";
import OverlayTogglePanel from "./panels/OverlayTogglePanel";
import SocialMediaIntelPanel from "./panels/SocialMediaIntelPanel";
import AlertStreamBar from "./panels/AlertStreamBar";

// Effects
import RadarSweep from "./effects/RadarSweep";
import GeospatialGrid from "./effects/GeospatialGrid";
import UserLocationMarker from "./effects/UserLocationMarker";
import GeocodedTargetMarker from "./effects/GeocodedTargetMarker";

// Layers
import RainfallHeatmap from "./layers/RainfallHeatmap";
import HumidityOverlay from "./layers/HumidityOverlay";
import SosBeacons from "./layers/SosBeacons";
import ShelterMarkers from "./layers/ShelterMarkers";
import DisasterMarkers from "./layers/DisasterMarkers";
import SafeZones from "./layers/SafeZones";
import FloodRiskZones from "./layers/FloodRiskZones";
import HazardZones from "./layers/HazardZones";
import { AlertCircle, X } from "lucide-react";
import DisasterHeatmapPopup from "./panels/DisasterHeatmapPopup";
import SosModal from "./panels/SosModal";
import useSimulation from "../../hooks/useSimulation";

// Master baseline disaster hotspots across India with Before/After satellite dataset bindings
export const DEFAULT_DISASTER_SPOTS = [
  {
    id: "disaster-flood-mumbai",
    disasterType: "FLOOD",
    title: "Mumbai Coastal Surge & Mithi River Inundation",
    message: "Critical water ingress along low-lying urban sectors. 1.8m coastal flood surge.",
    location: "Mumbai Coastal Sector, Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    severity: 9,
    affectedRadius: 10,
  },
  {
    id: "disaster-flood-assam",
    disasterType: "FLOOD",
    title: "Assam Brahmaputra Valley Alluvial Inundation",
    message: "Braided river overflow submerging 400+ rural villages and agricultural farmland.",
    location: "Kaziranga-Brahmaputra Basin, Assam",
    latitude: 26.6528,
    longitude: 93.1711,
    severity: 9,
    affectedRadius: 22,
  },
  {
    id: "disaster-landslide-chamoli",
    disasterType: "LANDSLIDE",
    title: "Joshimath-Chamoli Highway Hillside Collapse",
    message: "Major slope shear failure across 2.4km. Debris flow blocking arterial transport route.",
    location: "Chamoli District, Uttarakhand",
    latitude: 30.5526,
    longitude: 79.5658,
    severity: 8,
    affectedRadius: 6,
  },
  {
    id: "disaster-landslide-wayanad",
    disasterType: "LANDSLIDE",
    title: "Wayanad Western Ghats Debris Avalanche",
    message: "High-velocity red mudflow carving a 400m-wide swath straight down plantation slopes.",
    location: "Chooralmala-Meppadi, Wayanad, Kerala",
    latitude: 11.5218,
    longitude: 76.1342,
    severity: 10,
    affectedRadius: 7,
  },
  {
    id: "disaster-quake-bhuj",
    disasterType: "EARTHQUAKE",
    title: "Kutch Seismogenic Fault Rupture (M7.1)",
    message: "High-energy ground acceleration. Major masonry collapses in urban cluster.",
    location: "Bhuj Epicenter, Gujarat",
    latitude: 23.242,
    longitude: 69.6669,
    severity: 9,
    affectedRadius: 14,
  },
  {
    id: "disaster-quake-delhi",
    disasterType: "EARTHQUAKE",
    title: "Delhi-NCR Ridge Seismotectonic Fracture",
    message: "Metropolitan corridor shear cracks, bridge fissure stress points, and facade fractures.",
    location: "Delhi-NCR Ridge Fault, New Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    severity: 8,
    affectedRadius: 12,
  },
  {
    id: "disaster-cyclone-odisha",
    disasterType: "CYCLONE",
    title: "Bay of Bengal Severe Cyclonic Storm Surge",
    message: "150 km/h sustained gusts with 3.2m storm surges threatening coastal embankments.",
    location: "Puri Coastline, Odisha",
    latitude: 19.8135,
    longitude: 85.8312,
    severity: 9,
    affectedRadius: 18,
  },
];


// India + surroundings — hard geographic fence
const INDIA_BOUNDS = [[4.0, 63.0], [38.0, 98.0]];

/**
 * MapFlyController — lives inside MapContainer.
 * Flies to a new center/zoom whenever regionCenter changes.
 * Also sets maxBounds on mount.
 */
function MapFlyController({ regionCenter, regionZoom }) {
  const map = useMap();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!map) return;
    map.setMaxBounds(INDIA_BOUNDS);
    if (!mountedRef.current) {
      map.setView([regionCenter.lat, regionCenter.lng], regionZoom, { animate: false });
      mountedRef.current = true;
    }
  }, [map]); // eslint-disable-line

  // Fly to region on change
  useEffect(() => {
    if (!map || !mountedRef.current) return;
    map.flyTo(
      [regionCenter.lat, regionCenter.lng],
      regionZoom,
      { animate: true, duration: 1.5, easeLinearity: 0.3 }
    );
  }, [regionCenter.lat, regionCenter.lng, regionZoom]); // eslint-disable-line

  return null;
}

export const OSM_PRESETS = {
  standard: {
    id: "standard",
    label: "OpenStreetMap Standard",
    shortName: "OSM Standard",
    badge: "Official Tiles",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  humanitarian: {
    id: "humanitarian",
    label: "OSM Humanitarian (HOT)",
    shortName: "OSM Humanitarian",
    badge: "Disaster Relief",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">Humanitarian OpenStreetMap Team</a>',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  dark: {
    id: "dark",
    label: "OSM Dark Tactical",
    shortName: "OSM Dark",
    badge: "Night Ops",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
    className: "osm-dark-tiles",
  },
  topo: {
    id: "topo",
    label: "OpenTopoMap (Topography)",
    shortName: "OpenTopoMap",
    badge: "Elevation",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, SRTM | Map: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>',
    maxZoom: 17,
    subdomains: ["a", "b", "c"],
  },
};

/**
 * UnifiedDisasterMap
 * @param {object}   center      - { lat, lng } GPS center (overrides region center on Dashboard)
 * @param {array}    events      - disaster events from backend
 * @param {array}    shelters    - shelter objects from backend
 * @param {array}    alerts      - alert objects from backend
 * @param {function} onSimulate  - simulation trigger callback
 * @param {boolean}  readOnly    - hides simulation controls (landing page preview)
 */
export default function UnifiedDisasterMap({
  center: gpsCenterProp,
  events = [],
  shelters = [],
  alerts = [],
  onSimulate,
  readOnly = false,
}) {
  const { activeSimulation, resolveSimulation, getActive } = useSimulation();
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [selectedDisasterSpot, setSelectedDisasterSpot] = useState(null);
  const [baseMapPreset, setBaseMapPreset] = useState("standard");
  const currentPreset = OSM_PRESETS[baseMapPreset] || OSM_PRESETS.standard;

  useEffect(() => {
    if (!readOnly) {
      getActive();
      const interval = setInterval(() => {
        getActive();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [getActive, readOnly]);

  // Combined national disaster data across all territories — disasters are nationwide and dynamic
  const allRegionsList = Object.values(REGIONS);
  const combinedRegionData = {
    floodZones: allRegionsList.flatMap((r) => r.floodZones || []),
    hazardZones: allRegionsList.flatMap((r) => r.hazardZones || []),
    sos: allRegionsList.flatMap((r) => r.sos || []),
    safeZones: allRegionsList.flatMap((r) => r.safeZones || []),
  };

  const PAN_INDIA_CENTER = { lat: 21.7679, lng: 78.8718 };
  const PAN_INDIA_ZOOM = 5;

  const activeCenter = searchedLocation
    ? { lat: searchedLocation.lat, lng: searchedLocation.lng }
    : gpsCenterProp || PAN_INDIA_CENTER;

  const mapCenter = searchedLocation
    ? { lat: searchedLocation.lat, lng: searchedLocation.lng }
    : gpsCenterProp ? gpsCenterProp : PAN_INDIA_CENTER;

  const mapZoom = searchedLocation
    ? searchedLocation.zoom || 14
    : gpsCenterProp ? 11 : PAN_INDIA_ZOOM;

  // ── Layer toggle state ────────────────────────────────────────────────────
  const [activeLayers, setActiveLayers] = useState([
    "rainfall", "sos", "shelters", "disasters", "flood", "hazards", "socialintel"
  ]);

  const toggleLayer = (id) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  // Combined list of backend events, active drill simulations, and baseline hotspots
  const combinedDisasterEvents = useMemo(() => {
    const list = [...events];

    // Include active drill simulation if triggered
    if (activeSimulation && activeSimulation.latitude && activeSimulation.longitude) {
      if (!list.some((e) => e.id === activeSimulation.id)) {
        list.unshift({
          ...activeSimulation,
          title: `Simulated ${activeSimulation.disasterType} Drill Impact`,
        });
      }
    }

    // Include default baseline hotspots so spots are always clickable across India
    DEFAULT_DISASTER_SPOTS.forEach((spot) => {
      if (!list.some((e) => e.id === spot.id)) {
        list.push(spot);
      }
    });

    return list;
  }, [events, activeSimulation]);



  return (
    <div
      className={`unified-map-root ${baseMapPreset === "dark" ? "theme-osm-dark" : ""}`}
      style={{
        position: "relative", width: "100%", height: "100%", minHeight: "600px",
        overflow: "hidden", background: "#0a0c14", fontFamily: "Inter, sans-serif", color: "#fff",
      }}
    >

      {/* ── UI Panel Overlays ── */}
      <CommandHeader
        readOnly={readOnly}
        onSelectLocation={(loc) => setSearchedLocation(loc)}
        selectedLocation={searchedLocation}
        onClearLocation={() => setSearchedLocation(null)}
      />
      <OverlayTogglePanel
        activeLayers={activeLayers}
        toggleLayer={toggleLayer}
        baseMapPreset={baseMapPreset}
        setBaseMapPreset={setBaseMapPreset}
        osmPresets={OSM_PRESETS}
        hasSosButton={!readOnly}
      />
      
      {/* Social Media NLP Intel Panel */}
      {activeLayers.includes("socialintel") && (
        <SocialMediaIntelPanel
          onFocusLocation={(loc) => {
            if (loc && loc.lat && loc.lng) {
              setSearchedLocation(loc);
            }
          }}
        />
      )}


      <AlertStreamBar alerts={alerts} />
      <RadarSweep />
      <GeospatialGrid />

      {/* ── Active Environmental Telemetry Indicator (Blank Space: Above Ticker, Clear of Panels) ── */}
      {(activeLayers.includes("rainfall") || activeLayers.includes("humidity")) && (
        <div className="absolute bottom-14 left-[310px] z-[1000] flex flex-wrap items-center gap-3 pointer-events-auto transition-all duration-300">
          {activeLayers.includes("rainfall") && (
            <div className="glass-panel px-3.5 py-2 rounded-xl border border-sky-500/40 bg-slate-950/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-wider text-sky-400 uppercase">Doppler Rain Radar</span>
                <div className="flex items-center gap-2.5 text-[10px] text-slate-300 font-medium mt-0.5">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]"></span> Light</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span> Heavy</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span> Torrential</span>
                </div>
              </div>
            </div>
          )}
          {activeLayers.includes("humidity") && (
            <div className="glass-panel px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-slate-950/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase">Atmospheric Moisture</span>
                <div className="flex items-center gap-2.5 text-[10px] text-slate-300 font-medium mt-0.5">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span> &lt;70%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span> 70-85%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]"></span> &gt;85%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* SOS Floating Action Button */}
      {!readOnly && (
        <button
          onClick={() => setIsSosOpen(true)}
          className="absolute top-20 left-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
        >
          <AlertCircle className="w-4 h-4 text-white" />
          <span>SEND SOS SIGNAL</span>
        </button>
      )}

      {/* SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} userLocation={activeCenter} />

      {/* ── Disaster Satellite Damage & AI Heatmap Inspection Modal ── */}
      {selectedDisasterSpot && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDisasterSpot(null);
          }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <div className="relative rounded-2xl border border-cyan-500/40 bg-slate-950/95 shadow-[0_0_60px_rgba(0,180,255,0.35)] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setSelectedDisasterSpot(null)}
              className="absolute top-3.5 right-3.5 z-30 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Close Analysis"
            >
              <X className="w-4 h-4" />
            </button>
            <DisasterHeatmapPopup disaster={selectedDisasterSpot} />
          </div>
        </div>
      )}

      {/* ── Main OpenStreetMap MapContainer ── */}
      <MapContainer
        className={baseMapPreset === "dark" ? "theme-osm-dark" : ""}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        minZoom={4}
        maxZoom={18}
        zoomControl={false}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
      >
        {/* Fly controller — responds to position changes */}
        <MapFlyController regionCenter={mapCenter} regionZoom={mapZoom} />

        {/* ── OpenStreetMap Base Tile Layer ── */}
        <TileLayer
          key={currentPreset.id}
          url={currentPreset.url}
          attribution={currentPreset.attribution}
          subdomains={currentPreset.subdomains}
          maxZoom={currentPreset.maxZoom}
          className={currentPreset.className || ""}
          keepBuffer={4}
        />

        {/* GPS pulse (full dashboard only) */}
        {!readOnly && gpsCenterProp && (
          <UserLocationMarker position={[gpsCenterProp.lat, gpsCenterProp.lng]} />
        )}

        {/* Precision Geocoded Pin & Telemetry overlay for searched address/coordinates */}
        {searchedLocation && (
          <GeocodedTargetMarker
            location={searchedLocation}
            onClear={() => setSearchedLocation(null)}
          />
        )}

        {/* ── Environmental Layers ── */}
        {activeLayers.includes("rainfall")   && <RainfallHeatmap center={activeCenter} />}
        {activeLayers.includes("humidity")   && <HumidityOverlay center={activeCenter} />}
        {activeLayers.includes("flood")      && <FloodRiskZones regionData={combinedRegionData} />}
        {activeLayers.includes("hazards")    && <HazardZones regionData={combinedRegionData} />}

        {/* ── Operational Layers ── */}
        {activeLayers.includes("sos")        && <SosBeacons regionData={combinedRegionData} events={events} />}
        {activeLayers.includes("shelters")   && <ShelterMarkers shelters={shelters} />}
        {activeLayers.includes("safezones")  && <SafeZones regionData={combinedRegionData} />}


        {/* Backend and simulation disaster event markers with Before/After Heatmap popups */}
        {activeLayers.includes("disasters")  && (
          <DisasterMarkers
            events={combinedDisasterEvents}
            onSelectDisaster={(d) => setSelectedDisasterSpot(d)}
          />
        )}
      </MapContainer>
    </div>
  );
}

