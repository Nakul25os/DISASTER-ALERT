import { useRef, useEffect } from "react";
import L from "leaflet";
import { Layers, CloudRain, Droplets, AlertTriangle, Shield, MapPin, Activity, Flame, Map, Radio } from "lucide-react";

export default function OverlayTogglePanel({
  activeLayers,
  toggleLayer,
  baseMapPreset = "standard",
  setBaseMapPreset,
  osmPresets = {},
  hasSosButton = false,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    // Prevent Leaflet from capturing mouse wheel and click events from this panel
    L.DomEvent.disableScrollPropagation(el);
    L.DomEvent.disableClickPropagation(el);

    const onWheel = (e) => {
      // Ensure the panel scrolls natively and doesn't zoom the map
      e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const categories = [
    {
      title: "Environmental",
      layers: [
        { id: "rainfall", label: "Realtime Rainfall", icon: CloudRain, color: "text-blue-400" },
        { id: "humidity", label: "Moisture/Humidity", icon: Droplets, color: "text-emerald-400" },
        { id: "flood", label: "Flood Risk Zones", icon: AlertTriangle, color: "text-red-400" },
        { id: "hazards", label: "Extreme Hazards", icon: Flame, color: "text-orange-500" },
      ],
    },
    {
      title: "Operational",
      layers: [
        { id: "sos", label: "Active SOS Beacons", icon: Activity, color: "text-red-500" },
        { id: "shelters", label: "Relief Shelters", icon: Shield, color: "text-blue-500" },
        { id: "safezones", label: "Safe Zone Perimeters", icon: MapPin, color: "text-green-500" },
      ],
    },
    {
      title: "AI Analytics",
      layers: [
        { id: "socialintel", label: "Social Media Intel", icon: Radio, color: "text-cyan-400" },
      ],
    },
  ];

  const presetList = Object.values(osmPresets);

  return (
    <div
      ref={panelRef}
      onWheel={(e) => e.stopPropagation()}
      className={`absolute ${hasSosButton ? "top-36" : "top-24"} left-4 z-[1000] w-72 glow-panel rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar transition-all duration-300`}
      style={{
        maxHeight: hasSosButton ? "calc(100vh - 165px)" : "calc(100vh - 120px)",
        overscrollBehavior: "contain",
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-accent-blue" />
          <h3 className="font-bold tracking-widest text-sm uppercase text-white/90">Intelligence Layers</h3>
        </div>
      </div>

      {/* ── OpenStreetMap Base Map Preset Selector ── */}
      {presetList.length > 0 && setBaseMapPreset && (
        <div className="space-y-2 border-b border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Base Map</h4>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wider">
              OpenStreetMap
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {presetList.map((preset) => {
              const isSelected = baseMapPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBaseMapPreset(preset.id)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-accent-blue/20 border-accent-blue text-white shadow-[0_0_12px_rgba(0,80,255,0.25)] font-semibold"
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="text-[11px] leading-tight truncate">{preset.shortName}</div>
                  <div className="text-[9px] text-white/40 mt-0.5">{preset.badge}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {categories.map((cat) => (
        <div key={cat.title} className="space-y-2">
          <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold ml-1">{cat.title}</h4>
          <div className="flex flex-col gap-1">
            {cat.layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayers.includes(layer.id);
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all border ${
                    isActive 
                      ? "bg-accent-blue/20 border-accent-blue/50 shadow-[0_0_15px_rgba(0,80,255,0.15)]" 
                      : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? layer.color : "text-white/40"}`} />
                    <span className={`text-xs font-medium ${isActive ? "text-white" : "text-white/60"}`}>
                      {layer.label}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-accent-blue shadow-[0_0_8px_rgba(0,80,255,1)]" : "bg-white/20"}`} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
