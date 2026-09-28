import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { 
  Radio, 
  Sparkles, 
  RotateCcw, 
  MapPin, 
  Activity, 
  Flame, 
  ChevronUp, 
  ChevronDown, 
  Loader2, 
  Package,
  AlertOctagon,
  ExternalLink
} from "lucide-react";
import axios from "axios";

const SAMPLES = [
  {
    id: "rajendra-nagar",
    label: "Rajendra Nagar Flood",
    text: "HELP! Water has entered our house near Rajendra Nagar. We are trapped and need rescue.",
  },
  {
    id: "kankarbagh",
    label: "Kankarbagh Trap",
    text: "Waterlogging rising fast near Kankarbagh main road. Multiple elderly citizens trapped inside with no food or drinking water!",
  },
  {
    id: "vijay-nagar",
    label: "Vijay Nagar Fire",
    text: "Heavy smoke and flames spotted near Vijay Nagar market. Building caught fire, need immediate rescue and ambulance!",
  },
  {
    id: "hill-area",
    label: "Hill Area Landslide",
    text: "Massive landslide in hill area. Huge boulders and mudslide collapsed on the road. Multiple injured individuals trapped!",
  }
];

// Fallback local NLP engine in case backend is offline or loading
function localAnalyze(text) {
  const clean = text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  
  // Disaster detection
  const disasterMap = {
    flood: ["flood", "flooding", "flooded", "water entered", "water has entered", "water entering", "water inside", "waterlogging", "water logged", "heavy flooding"],
    fire: ["fire", "building caught fire", "burning", "smoke", "blaze", "flames", "caught fire"],
    landslide: ["landslide", "fallen rocks", "rocks blocked", "mudslide", "hillside collapse", "boulders", "slope collapse"],
    earthquake: ["earthquake", "tremor", "tremors", "shaking", "quake", "aftershock", "buildings collapsed", "cracked walls", "building cracked", "buildings have cracked"],
    cyclone: ["cyclone", "storm surge", "high winds", "uprooted trees", "cyclonic winds", "trees uprooted"]
  };
  
  let bestDisaster = "unknown";
  let maxDisScore = 0;
  for (const [disaster, kws] of Object.entries(disasterMap)) {
    let score = 0;
    for (const kw of kws) {
      if (clean.includes(kw)) score++;
    }
    if (score > maxDisScore) {
      maxDisScore = score;
      bestDisaster = disaster;
    }
  }

  // Emergency signals
  const emergencyKw = {
    "help": 10, "trapped": 30, "injured": 30, "medical": 20, "rescue": 20,
    "children": 15, "elderly": 15, "blocked": 15, "emergency": 15,
    "water entering": 15, "water has entered": 15, "water inside": 15, "flooded": 15,
    "collapsed": 25, "buildings collapsed": 30, "cracked": 15, "shaking": 15,
    "tremors": 15, "buried": 30, "missing": 20, "smoke": 15, "flames": 20,
    "burning": 15, "high winds": 15, "uprooted trees": 15, "storm surge": 20,
    "evacuate": 20, "evacuated": 20
  };

  let emergencyScore = 0;
  const emergencySignals = [];
  for (const [kw, pts] of Object.entries(emergencyKw)) {
    if (clean.includes(kw)) {
      emergencyScore += pts;
      emergencySignals.push(kw);
    }
  }

  // Location detection
  const knownLocations = ["Rajendra Nagar", "Kankarbagh", "Vijay Nagar", "Railway Station", "hill area"];
  let location = null;
  for (const loc of knownLocations) {
    if (clean.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  // Needs
  const needsMap = {
    rescue: ["rescue", "trapped"],
    medical: ["medical", "injured", "ambulance"],
    food: ["food"],
    water: ["drinking water", "water"],
    shelter: ["shelter", "evacuate", "evacuated", "homeless"]
  };
  const needs = [];
  for (const [need, kws] of Object.entries(needsMap)) {
    if (kws.some(kw => clean.includes(kw))) {
      needs.push(need);
    }
  }

  const bonusMap = { flood: 10, fire: 30, landslide: 25, earthquake: 30, cyclone: 20, unknown: 0 };
  emergencyScore += bonusMap[bestDisaster] || 0;
  emergencyScore = Math.min(100, emergencyScore);

  let severity = "LOW";
  if (emergencyScore >= 75) severity = "CRITICAL";
  else if (emergencyScore >= 50) severity = "HIGH";
  else if (emergencyScore >= 25) severity = "MODERATE";

  return {
    text,
    disaster_type: bestDisaster,
    location,
    emergency_score: emergencyScore,
    emergency_signals: emergencySignals,
    needs,
    severity
  };
}

export default function SocialMediaIntelPanel({ onFocusLocation }) {
  const [isOpen, setIsOpen] = useState(true);
  const [reportText, setReportText] = useState(
    "HELP! Water has entered our house near Rajendra Nagar. We are trapped and need rescue."
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    // Prevent Leaflet from capturing mouse wheel and click events from this panel
    L.DomEvent.disableScrollPropagation(el);
    L.DomEvent.disableClickPropagation(el);

    const onWheel = (e) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Auto-analyze initial report on mount
  useEffect(() => {
    handleAnalyze(reportText);
  }, []);

  const handleAnalyze = async (textToAnalyze = reportText) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // First attempt: call live FastAPI python-service
      const response = await axios.post(
        "http://localhost:8000/api/analyze",
        { text: textToAnalyze },
        { timeout: 3500 }
      );
      if (response.data) {
        setResult(response.data);
      }
    } catch (err) {
      console.warn("Python service direct call unavailable, using high-speed local NLP engine fallback", err);
      // Fallback: seamless client-side classifier with identical NLP logic
      const fallbackResult = localAnalyze(textToAnalyze);
      setResult(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReportText("");
    setResult(null);
    setErrorMsg(null);
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.45)]";
      case "HIGH":
        return "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)]";
      case "MODERATE":
        return "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]";
      default:
        return "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
    }
  };

  const getDisasterBadgeStyle = (disaster) => {
    switch (disaster?.toLowerCase()) {
      case "flood":
        return "bg-purple-900/40 border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
      case "fire":
        return "bg-orange-950/60 border-orange-500/60 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
      case "earthquake":
        return "bg-yellow-950/60 border-yellow-500/60 text-yellow-300";
      case "landslide":
        return "bg-amber-950/60 border-amber-600/60 text-amber-300";
      case "cyclone":
        return "bg-blue-950/60 border-blue-500/60 text-blue-300";
      default:
        return "bg-slate-800 border-slate-600 text-slate-300";
    }
  };

  return (
    <div 
      ref={panelRef}
      onWheel={(e) => e.stopPropagation()}
      className="absolute top-20 right-4 z-[1000] w-[340px] sm:w-[360px] max-h-[calc(100%-5.5rem)] flex flex-col rounded-2xl border border-white/10 bg-[#0d111a]/95 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-white overflow-hidden transition-all duration-300 font-sans"
    >
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 flex items-center justify-between border-b border-white/10 cursor-pointer select-none hover:bg-white/5 transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold tracking-wider text-xs uppercase text-white">
              Social Media Intel
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              NLP Real-time Classifier
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-3.5 space-y-3.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {/* Sample Chips */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                SAMPLES:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setReportText(sample.text);
                    handleAnalyze(sample.text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 font-medium transition-all"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Disaster Report / Tweet
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {reportText.length} CHARS
              </span>
            </div>

            <textarea
              rows={3}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste raw tweet, emergency tweet or citizen post..."
              className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || !reportText.trim()}
              onClick={() => handleAnalyze(reportText)}
              className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(0,140,255,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Classifying NLP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Analyze Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              title="Reset Input"
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Analysis Results Card */}
          {result && (
            <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-3 animate-[fadeIn_0.25s_ease-out]">
              {/* Badges Row: Severity & Type */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    SEVERITY:
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-black tracking-wider ${getSeverityStyle(result.severity)}`}>
                    {result.severity || "UNKNOWN"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    TYPE:
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-extrabold uppercase tracking-wider ${getDisasterBadgeStyle(result.disaster_type)}`}>
                    {result.disaster_type || "UNKNOWN"}
                  </span>
                </div>
              </div>

              {/* Location Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px]">Location:</span>
                </div>
                <strong className="text-white font-bold text-xs tracking-wide">
                  {result.location || "General Area / Unspecified"}
                </strong>
              </div>

              {/* Emergency Score Row & Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px]">Emergency Score:</span>
                  </div>
                  <strong className="text-amber-400 font-extrabold text-xs tracking-wider">
                    {result.emergency_score || 0}/100
                  </strong>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-700 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    style={{ width: `${Math.min(100, Math.max(5, result.emergency_score || 0))}%` }}
                  />
                </div>
              </div>

              {/* Emergency Signals */}
              {result.emergency_signals && result.emergency_signals.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      EMERGENCY SIGNALS:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.emergency_signals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-red-950/70 border border-red-800/50 text-red-300 text-[11px] font-medium tracking-wide"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Needs */}
              {result.needs && result.needs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      REQUIRED RELIEF:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.needs.map((need, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-[11px] font-medium uppercase tracking-wider"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
