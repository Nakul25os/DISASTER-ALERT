import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Zap, Activity, AlertTriangle, CheckCircle, ArrowRight, Eye, RefreshCw, Cpu, Layers, Camera, Maximize2, ShieldAlert } from "lucide-react";
import L from "leaflet";
import { DISASTER_REGISTRY } from "./disasterRegistryData";

export default function DisasterHeatmapPopup({ disaster }) {
  const containerRef = useRef(null);
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("compare"); // 'compare' | 'before' | 'after' | 'heatmap' | 'overlay'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [generatedAngles, setGeneratedAngles] = useState({});
  const [sliderVal, setSliderVal] = useState(65);

  // Prevent Leaflet from intercepting scroll or click events inside popup
  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableScrollPropagation(containerRef.current);
      L.DomEvent.disableClickPropagation(containerRef.current);
    }
  }, []);

  // Look up disaster record in registry
  let spotRecord = null;
  if (disaster && disaster.id && DISASTER_REGISTRY[disaster.id]) {
    spotRecord = DISASTER_REGISTRY[disaster.id];
  } else if (disaster && disaster.spot_id && DISASTER_REGISTRY[disaster.spot_id]) {
    spotRecord = DISASTER_REGISTRY[disaster.spot_id];
  } else {
    // Fallback matching by disaster type & keyword
    const typeStr = (disaster?.disasterType || "").toUpperCase();
    const locStr = (disaster?.location || "").toUpperCase();
    const titleStr = (disaster?.title || "").toUpperCase();

    if (locStr.includes("MUMBAI") || titleStr.includes("MUMBAI")) {
      spotRecord = DISASTER_REGISTRY["disaster-flood-mumbai"];
    } else if (locStr.includes("ASSAM") || titleStr.includes("ASSAM") || locStr.includes("KAZIRANGA")) {
      spotRecord = DISASTER_REGISTRY["disaster-flood-assam"];
    } else if (locStr.includes("CHAMOLI") || titleStr.includes("CHAMOLI") || locStr.includes("JOSHIMATH")) {
      spotRecord = DISASTER_REGISTRY["disaster-landslide-chamoli"];
    } else if (locStr.includes("WAYANAD") || titleStr.includes("WAYANAD") || locStr.includes("MEPPADI")) {
      spotRecord = DISASTER_REGISTRY["disaster-landslide-wayanad"];
    } else if (locStr.includes("BHUJ") || titleStr.includes("BHUJ") || locStr.includes("KUTCH")) {
      spotRecord = DISASTER_REGISTRY["disaster-quake-bhuj"];
    } else if (locStr.includes("DELHI") || titleStr.includes("DELHI") || locStr.includes("NCR")) {
      spotRecord = DISASTER_REGISTRY["disaster-quake-delhi"];
    } else if (locStr.includes("ODISHA") || titleStr.includes("ODISHA") || locStr.includes("PURI")) {
      spotRecord = DISASTER_REGISTRY["disaster-cyclone-odisha"];
    } else if (typeStr.includes("FLOOD") || typeStr.includes("RAIN")) {
      spotRecord = DISASTER_REGISTRY["disaster-flood-mumbai"];
    } else if (typeStr.includes("LANDSLIDE") || typeStr.includes("SLOPE")) {
      spotRecord = DISASTER_REGISTRY["disaster-landslide-chamoli"];
    } else if (typeStr.includes("QUAKE") || typeStr.includes("EARTHQUAKE")) {
      spotRecord = DISASTER_REGISTRY["disaster-quake-bhuj"];
    } else if (typeStr.includes("CYCLONE") || typeStr.includes("STORM")) {
      spotRecord = DISASTER_REGISTRY["disaster-cyclone-odisha"];
    } else {
      spotRecord = DISASTER_REGISTRY["disaster-flood-mumbai"];
    }
  }

  const angles = spotRecord?.angles || [];
  const currentAngle = angles[selectedAngleIndex] || angles[0] || {};
  const isCurrentAngleGenerated = !!generatedAngles[selectedAngleIndex];

  // Visual badge theme based on disaster type
  const typeStr = (disaster?.disasterType || spotRecord?.disasterType || "DISASTER").toUpperCase();
  let badgeColor = "bg-red-500/20 text-red-300 border-red-500/30";
  let accentGlow = "#ef4444";
  if (typeStr.includes("FLOOD")) {
    badgeColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    accentGlow = "#00f0ff";
  } else if (typeStr.includes("LANDSLIDE")) {
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    accentGlow = "#f59e0b";
  } else if (typeStr.includes("CYCLONE")) {
    badgeColor = "bg-teal-500/20 text-teal-300 border-teal-500/30";
    accentGlow = "#06b6d4";
  }

  // Simulate CNN inference with telemetry
  const handleGenerateHeatmap = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStep("Stacking 6-channel pre/post orthophoto tensors...");

    setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisStep(`Siamese Residual U-Net forward pass (${currentAngle.name || "Perspective"})...`);
    }, 400);

    setTimeout(() => {
      setAnalysisProgress(80);
      setAnalysisStep("Computing Turbo intensity colormap & change mask...");
    }, 850);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisStep("AI Heatmap generated successfully!");
      setIsAnalyzing(false);
      setGeneratedAngles((prev) => ({ ...prev, [selectedAngleIndex]: true }));
      setActiveTab("heatmap");
    }, 1250);
  };

  return (
    <div
      ref={containerRef}
      onWheel={(e) => e.stopPropagation()}
      className="p-4 sm:p-5 text-white w-[460px] max-w-[94vw] select-none font-sans"
    >
      {/* ── Spot Title & Location Header ── */}
      <div className="flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {typeStr} • SEV {disaster?.severity || spotRecord?.severity || 9}/10
            </span>
            <span className="text-[10px] text-white/50 font-mono">
              {Number(disaster?.latitude || spotRecord?.coords?.[0] || 0).toFixed(3)}°N,{" "}
              {Number(disaster?.longitude || spotRecord?.coords?.[1] || 0).toFixed(3)}°E
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
            {disaster?.title || spotRecord?.title || `${typeStr} Incident Zone`}
          </h3>
          <p className="text-[11px] text-white/60">
            {disaster?.location || spotRecord?.location || "Geographic Hotspot"}
          </p>
        </div>
      </div>

      {/* ── Multiple Images / Perspective Selector ── */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Satellite Captures ({angles.length} Available)</span>
          </span>
          <span className="text-[9px] text-white/40 font-mono">Select Angle to View</span>
        </div>

        {/* 3 distinct thumbnail/angle pills */}
        <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
          {angles.map((angle, idx) => {
            const isSelected = selectedAngleIndex === idx;
            return (
              <button
                key={angle.id || idx}
                type="button"
                onClick={() => {
                  setSelectedAngleIndex(idx);
                }}
                className={`relative flex flex-col items-start p-1.5 rounded-lg text-left transition-all overflow-hidden border ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Micro Thumbnail Preview */}
                <div className="w-full h-8 rounded overflow-hidden mb-1 relative bg-slate-900">
                  <img
                    src={angle.after}
                    alt={angle.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-white/80 bg-black/70 px-1 rounded">
                    Shot #{idx + 1}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-white leading-tight truncate w-full">
                  {angle.name.split(" ")[0]} {angle.name.split(" ")[1] || ""}
                </span>
                <span className="text-[8px] text-white/50 truncate w-full">
                  {angle.damageExtent} Impact
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Visual Screen (Comparison / Single / Heatmap / Blend) ── */}
      <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/80 shadow-inner">
        {/* Active Angle Description */}
        <div className="px-2.5 py-1 bg-white/5 border-b border-white/10 flex items-center justify-between text-[10px]">
          <span className="text-cyan-300 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {currentAngle.name || "Satellite Perspective"}
          </span>
          <span className="text-white/40 font-mono text-[9px] truncate max-w-[170px]">
            {currentAngle.hotspot || "Target Sector"}
          </span>
        </div>

        {/* 1. Comparison Mode: Side-by-side Before & After */}
        {activeTab === "compare" && (
          <div className="grid grid-cols-2 gap-0.5 bg-white/15">
            {/* Before */}
            <div className="relative aspect-[4/3] group overflow-hidden bg-slate-900">
              <img
                src={currentAngle.before}
                alt="Before Disaster"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-emerald-500/50 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                BEFORE DISASTER
              </div>
              <div className="absolute bottom-1 right-2 text-[8px] text-white/70 bg-black/70 px-1 rounded font-mono">
                Pre-Event Baseline
              </div>
            </div>

            {/* After */}
            <div className="relative aspect-[4/3] group overflow-hidden bg-slate-900">
              <img
                src={currentAngle.after}
                alt="After Disaster"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-red-500/50 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                AFTER DISASTER
              </div>
              <div className="absolute bottom-1 right-2 text-[8px] text-white/70 bg-black/70 px-1 rounded font-mono">
                Post-Event Impact
              </div>
            </div>
          </div>
        )}

        {/* 2. Single View: Before */}
        {activeTab === "before" && (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
            <img src={currentAngle.before} alt="Before" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
              BEFORE DISASTER • PRE-EVENT SATELLITE BASELINE
            </div>
          </div>
        )}

        {/* 3. Single View: After */}
        {activeTab === "after" && (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
            <img src={currentAngle.after} alt="After" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/85 border border-red-500/50 text-[10px] font-bold text-red-400">
              AFTER DISASTER • DAMAGE FOOTPRINT
            </div>
          </div>
        )}

        {/* 4. Heatmap View: AI Siamese CNN Damage Heatmap with Green-Yellow-Red severity indication */}
        {activeTab === "heatmap" && (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
            <img src={currentAngle.heatmap} alt="AI Heatmap" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 border border-purple-500/50 text-[10px] font-bold text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              AI SEVERITY HEATMAP (CONTINUOUS FIELD)
            </div>
            {/* Severity Colormap Scale Legend */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-white/90 bg-black/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/15 font-mono shadow-lg">
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Low (Safe)
              </span>
              <div className="flex-1 mx-2.5 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-600 shadow-inner" />
              <span className="flex items-center gap-1 font-bold text-yellow-400 mr-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                Medium
              </span>
              <span className="flex items-center gap-1 font-bold text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                High (Critical)
              </span>
            </div>
          </div>
        )}

        {/* 5. Overlay View: Interactive Blend Slider */}
        {activeTab === "overlay" && (
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
            {/* Background After Image */}
            <img src={currentAngle.after} alt="After Satellite View" className="absolute inset-0 w-full h-full object-cover" />
            {/* Overlay Severity Heatmap with controllable opacity */}
            <img
              src={currentAngle.heatmap}
              alt="Heatmap Overlay"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
              style={{ opacity: (sliderVal / 100) * 0.70 }}
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 border border-cyan-500/50 text-[10px] font-bold text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SEVERITY HEATMAP OVERLAY ({sliderVal}%)
            </div>
            {/* Overlay mini-legend */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] text-white/90 bg-black/90 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 font-mono">
              <span className="text-emerald-400 font-bold">● Low (Green)</span>
              <div className="flex-1 mx-2 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-600" />
              <span className="text-yellow-400 font-bold mr-1">● Medium (Yellow)</span>
              <span className="text-red-400 font-bold">● High (Red)</span>
            </div>
          </div>
        )}

        {/* Analyzing Overlay Loading State */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="relative mb-3">
              <Cpu className="w-9 h-9 text-cyan-400 animate-bounce" />
              <div className="absolute inset-0 bg-cyan-400/30 blur-lg rounded-full" />
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Analyzing Satellite Imagery...
            </div>
            <p className="text-[10px] text-cyan-300/90 text-center font-mono mb-3">
              {analysisStep}
            </p>
            {/* Progress Bar */}
            <div className="w-52 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Overlay Slider (shown in overlay mode) ── */}
      {activeTab === "overlay" && (
        <div className="mt-2.5 flex items-center gap-2 px-1">
          <span className="text-[10px] text-white/60">Intensity:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={sliderVal}
            onChange={(e) => setSliderVal(Number(e.target.value))}
            className="flex-1 accent-cyan-400 h-1.5 bg-white/20 rounded cursor-pointer"
          />
          <span className="text-[10px] text-cyan-300 font-mono w-8 text-right">{sliderVal}%</span>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 mt-2.5 bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("compare")}
          className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === "compare"
              ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          Side-by-Side
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("before")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === "before"
              ? "bg-emerald-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          Before
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("after")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === "after"
              ? "bg-red-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          After
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isCurrentAngleGenerated) {
              handleGenerateHeatmap();
            } else {
              setActiveTab("heatmap");
            }
          }}
          className={`flex-1 py-1 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
            activeTab === "heatmap"
              ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              : "text-purple-300 hover:text-white hover:bg-purple-500/20"
          }`}
        >
          <Zap className="w-3 h-3 text-purple-300" />
          <span>Heatmap</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("overlay")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
            activeTab === "overlay"
              ? "bg-cyan-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>Overlay</span>
        </button>
      </div>

      {/* ── Generate Heatmap CTA Button (if not generated yet for this angle) ── */}
      {!isCurrentAngleGenerated && (
        <button
          type="button"
          onClick={handleGenerateHeatmap}
          disabled={isAnalyzing}
          className="w-full mt-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(99,102,241,0.35)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span>ANALYZE SATELLITE IMAGES & GENERATE HEATMAP</span>
        </button>
      )}

      {/* ── Spot Damage Telemetry & Action Metrics ── */}
      <div className="mt-2.5 bg-black/40 rounded-xl p-2.5 border border-white/10">
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-white/50 block font-mono">
              Damage Extent
            </span>
            <span className="text-sm font-bold text-red-400 font-mono">
              {currentAngle.damageExtent || "42.5%"}
            </span>
          </div>

          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-white/50 block font-mono">
              Peak Intensity
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {currentAngle.peakIntensity || "0.99 / 1.0"}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1 text-[10px]">
          <div className="flex items-start gap-1.5 text-white/70">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Hotspot:</strong> {currentAngle.hotspot || "Active Disaster Sector"}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-white/70">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-red-300 font-medium">
              <strong className="text-white">Urgency:</strong> {currentAngle.urgency || "LEVEL 1 EMERGENCY"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer Link to Full Damage Analyzer Page ── */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
        <span className="text-white/40 text-[10px]">Siamese CNN Engine v2.4</span>
        <Link
          to={`/damage-analyzer?disaster=${spotRecord?.spot_id || "mumbai"}`}
          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Full Diagnostic Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
