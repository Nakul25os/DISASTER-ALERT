import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, X, Loader2, Crosshair, Sparkles, ArrowRight } from "lucide-react";
import axios from "axios";

// Instant offline cached major Indian locations & disaster hotspots
const PRESET_LOCATIONS = [
  {
    name: "Colaba, South Mumbai",
    displayName: "Colaba, South Mumbai, Maharashtra, India",
    lat: 18.9067,
    lng: 72.8147,
    category: "Coastal Sector",
    state: "Maharashtra",
    zoom: 14,
  },
  {
    name: "Marine Drive, Mumbai",
    displayName: "Marine Drive Promenade, Mumbai, Maharashtra",
    lat: 18.9438,
    lng: 72.8232,
    category: "Coastal Sector",
    state: "Maharashtra",
    zoom: 14,
  },
  {
    name: "Bandra Kurla Complex (BKC)",
    displayName: "Bandra Kurla Complex, Mumbai, Maharashtra",
    lat: 19.0657,
    lng: 72.8687,
    category: "Commercial Hub",
    state: "Maharashtra",
    zoom: 14,
  },
  {
    name: "Kaziranga-Brahmaputra Basin",
    displayName: "Kaziranga National Park, Golaghat / Nagaon, Assam",
    lat: 26.6528,
    lng: 93.1711,
    category: "Flood Hazard Zone",
    state: "Assam",
    zoom: 12,
  },
  {
    name: "Joshimath-Chamoli Corridor",
    displayName: "Joshimath, Chamoli District, Uttarakhand",
    lat: 30.5526,
    lng: 79.5658,
    category: "Landslide Risk Area",
    state: "Uttarakhand",
    zoom: 13,
  },
  {
    name: "Chooralmala, Wayanad",
    displayName: "Chooralmala, Meppadi, Wayanad District, Kerala",
    lat: 11.5218,
    lng: 76.1342,
    category: "Slope Hazard Zone",
    state: "Kerala",
    zoom: 13,
  },
  {
    name: "Bhuj Fault Epicenter",
    displayName: "Bhuj, Kutch District, Gujarat",
    lat: 23.2420,
    lng: 69.6669,
    category: "Seismic Zone V",
    state: "Gujarat",
    zoom: 12,
  },
  {
    name: "Connaught Place, New Delhi",
    displayName: "Connaught Place, Central Delhi, Delhi-NCR",
    lat: 28.6304,
    lng: 77.2177,
    category: "Metropolitan Core",
    state: "Delhi",
    zoom: 14,
  },
  {
    name: "Puri Coastal Embankment",
    displayName: "Puri Coastline, Puri District, Odisha",
    lat: 19.8135,
    lng: 85.8312,
    category: "Cyclone Hazard Sector",
    state: "Odisha",
    zoom: 13,
  },
  {
    name: "Electronic City, Bengaluru",
    displayName: "Electronic City, Bengaluru Urban, Karnataka",
    lat: 12.8399,
    lng: 77.6770,
    category: "Urban Sector",
    state: "Karnataka",
    zoom: 13,
  },
  {
    name: "Musi River Basin, Hyderabad",
    displayName: "Musi River Corridor, Hyderabad, Telangana",
    lat: 17.3850,
    lng: 78.4867,
    category: "River Inundation Zone",
    state: "Telangana",
    zoom: 13,
  },
];

export default function GeocodeSearchBar({ onSelectLocation, selectedLocation, onClearLocation }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Check if string looks like coordinate: e.g. "18.906, 72.814"
  const parseCoordinates = (str) => {
    const match = str.match(/^(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)$/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    return null;
  };

  // Perform geocode query with local presets + live OpenStreetMap Nominatim API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const qLower = query.toLowerCase().trim();

    // Check coordinate input first
    const coords = parseCoordinates(query);
    if (coords) {
      setResults([
        {
          name: `GPS Point: ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`,
          displayName: `Exact Geocoded Coordinates (${coords.lat}, ${coords.lng})`,
          lat: coords.lat,
          lng: coords.lng,
          category: "Direct GPS Coordinates",
          zoom: 15,
        },
      ]);
      setLoading(false);
      return;
    }

    // Filter instant local presets
    const localMatches = PRESET_LOCATIONS.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.displayName.toLowerCase().includes(qLower) ||
        (p.state && p.state.toLowerCase().includes(qLower))
    );

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=in&limit=6&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
            timeout: 5000,
          }
        );

        const apiResults = (res.data || []).map((item) => ({
          name: item.name || item.display_name.split(",")[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: item.type ? item.type.replace(/_/g, " ") : "Location",
          state: item.address?.state || item.address?.country || "India",
          zoom: item.type === "city" || item.type === "administrative" ? 11 : 14,
        }));

        // Deduplicate and combine local + live results
        const combined = [...localMatches];
        apiResults.forEach((apiItem) => {
          if (!combined.some((c) => Math.abs(c.lat - apiItem.lat) < 0.005 && Math.abs(c.lng - apiItem.lng) < 0.005)) {
            combined.push(apiItem);
          }
        });

        setResults(combined);
      } catch (err) {
        // Fallback to local matches if network/Nominatim is slow
        setResults(localMatches);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSelect = (loc) => {
    setQuery(loc.name);
    setIsOpen(false);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    if (onClearLocation) {
      onClearLocation();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm sm:max-w-md">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-cyan-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Geocode search (e.g. Colaba, Mumbai, Lat/Lng)..."
          className="w-full pl-9 pr-16 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950/95 focus:bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 text-xs text-white placeholder-slate-400 outline-none backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.12)] focus:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete / Preset Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-[1500] rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
          {/* Quick Header */}
          <div className="px-3 py-1.5 bg-cyan-950/40 border-b border-white/10 flex items-center justify-between text-[10px] text-cyan-300 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1 font-bold">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>GIS Geocoding Telemetry</span>
            </span>
            <span className="text-slate-400">{results.length} Matches</span>
          </div>

          {/* Result Items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {results.length > 0 ? (
              results.map((loc, idx) => (
                <button
                  key={`${loc.lat}-${loc.lng}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-cyan-500/15 transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="mt-0.5 p-1 rounded-md bg-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                        {loc.name}
                      </p>
                      <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0">
                        {loc.lat.toFixed(3)}°, {loc.lng.toFixed(3)}°
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {loc.displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {loc.category}
                      </span>
                      {loc.state && (
                        <span className="text-[8px] text-slate-400 font-mono">
                          {loc.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all self-center opacity-0 group-hover:opacity-100" />
                </button>
              ))
            ) : !loading && query.trim() ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <p>No geocoded results found for "{query}".</p>
                <p className="text-[10px] text-slate-500 mt-1">Try searching a city, street (e.g. Colaba, Mumbai) or raw latitude, longitude.</p>
              </div>
            ) : (
              /* Quick Suggested Indian Hotspots */
              <div className="p-2 space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>Popular Indian Geocoded Hotspots</span>
                </div>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {PRESET_LOCATIONS.slice(0, 6).map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSelect(preset)}
                      className="text-left p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 transition-all text-[11px] text-slate-200 hover:text-white flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
