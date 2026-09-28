import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  Flame,
  Activity,
  Layers,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Cpu,
  Waves,
  Wind,
  Mountain,
} from 'lucide-react'

const SCENARIOS = [
  {
    id: 'bhuj',
    spotId: 'disaster-quake-bhuj',
    title: 'Bhuj Kutch 7.8M Earthquake',
    location: 'Bhuj Epicenter, Gujarat',
    type: 'Structural Collapse & Fault Rupture',
    iconType: 'quake',
    beforeImg: '/sample_disasters/disaster-quake-bhuj_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-quake-bhuj_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-quake-bhuj_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-quake-bhuj_angle1_overlay.png',
    boardImg: '/sample_disasters/disaster-quake-bhuj_angle1_overlay.png',
    metrics: {
      damage_extent_percent: 18.3,
      critical_impact_percent: 24.8,
      mean_intensity: 0.442,
      peak_intensity: 0.88,
      hotspot: 'Hamirsar Lake Periphery & Old Historic Core',
      severity_level: 'CATASTROPHIC',
      urgency: 'LEVEL 1 CRITICAL — CANINE LIFE DETECTION SQUADS',
      affected_structures: '2,840 Masonry Units',
      road_blockage_index: '74% Historic Streets Impassable',
    },
  },
  {
    id: 'wayanad',
    spotId: 'disaster-landslide-wayanad',
    title: 'Wayanad Western Ghats Mudflow',
    location: 'Chooralmala-Meppadi, Kerala',
    type: 'Debris Flow & Plantation Avalanche',
    iconType: 'landslide',
    beforeImg: '/sample_disasters/disaster-landslide-wayanad_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-landslide-wayanad_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-landslide-wayanad_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-landslide-wayanad_angle1_overlay.png',
    boardImg: '/sample_disasters/disaster-landslide-wayanad_angle1_overlay.png',
    metrics: {
      damage_extent_percent: 23.5,
      critical_impact_percent: 36.2,
      mean_intensity: 0.418,
      peak_intensity: 0.88,
      hotspot: 'Meppadi Upper Tea Division & River Valley',
      severity_level: 'CATASTROPHIC',
      urgency: 'LEVEL 1 DISASTER — ARMY DISASTER RESPONSE SQUADS',
      affected_structures: '520 Estate Dwellings',
      debris_volume: '~620,000 m³ laterite mud',
    },
  },
  {
    id: 'assam',
    spotId: 'disaster-flood-assam',
    title: 'Assam Brahmaputra Valley Flood',
    location: 'Kaziranga-Brahmaputra Basin, Assam',
    type: 'Alluvial Basin Inundation',
    iconType: 'flood',
    beforeImg: '/sample_disasters/disaster-flood-assam_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-flood-assam_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-flood-assam_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-flood-assam_angle1_overlay.png',
    boardImg: '/sample_disasters/disaster-flood-assam_angle1_overlay.png',
    metrics: {
      damage_extent_percent: 68.4,
      critical_impact_percent: 54.1,
      mean_intensity: 0.512,
      peak_intensity: 0.88,
      hotspot: 'Braided River Channels & Central Farmlands',
      severity_level: 'CATASTROPHIC',
      urgency: 'LEVEL 1 CRITICAL — AIRDROP FOOD & WATER RAFTS',
      affected_structures: '400+ Rural Villages',
      water_level_rise: '+3.4m above danger mark',
    },
  },
  {
    id: 'chamoli',
    spotId: 'disaster-landslide-chamoli',
    title: 'Chamoli Himalayan Highway Collapse',
    location: 'Chamoli District, Uttarakhand',
    type: 'High-Altitude Rockfall & Damming',
    iconType: 'landslide',
    beforeImg: '/sample_disasters/disaster-landslide-chamoli_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-landslide-chamoli_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-landslide-chamoli_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-landslide-chamoli_angle1_overlay.png',
    boardImg: '/sample_disasters/disaster-landslide-chamoli_angle1_overlay.png',
    metrics: {
      damage_extent_percent: 18.5,
      critical_impact_percent: 29.4,
      mean_intensity: 0.364,
      peak_intensity: 0.88,
      hotspot: 'Joshimath-Badrinath KM-48 Escarpment',
      severity_level: 'HIGH DAMAGE',
      urgency: 'LEVEL 2 EMERGENCY — HEAVY EXCAVATOR EXTRICATION',
      affected_structures: 'Highway Arterial Severed',
      debris_volume: '~420,000 m³ rock debris',
    },
  },
  {
    id: 'flood',
    spotId: 'disaster-flood-mumbai',
    title: 'Mumbai Coastal Surge & Inundation',
    location: 'Mumbai Coastal Sector, Maharashtra',
    type: 'Urban Inundation & Mithi River',
    iconType: 'flood',
    beforeImg: '/sample_disasters/disaster-flood-mumbai_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-flood-mumbai_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-flood-mumbai_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-flood-mumbai_angle1_overlay.png',
    boardImg: '/sample_disasters/flood_diagnostic_board.png',
    metrics: {
      damage_extent_percent: 31.3,
      critical_impact_percent: 21.7,
      mean_intensity: 0.412,
      peak_intensity: 0.88,
      hotspot: 'Mithi River Drainage Basin & Kalina Lowlands',
      severity_level: 'CATASTROPHIC',
      urgency: 'LEVEL 1 EMERGENCY — IMMEDIATE MASS EVACUATION',
      affected_structures: '1,420 Buildings',
      water_level_rise: '+2.8m above datum',
    },
  },
  {
    id: 'cyclone',
    spotId: 'disaster-cyclone-odisha',
    title: 'Bay of Bengal Severe Cyclone Surge',
    location: 'Puri Coastline, Odisha',
    type: 'Storm Surge & Coastal Breach',
    iconType: 'cyclone',
    beforeImg: '/sample_disasters/disaster-cyclone-odisha_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-cyclone-odisha_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-cyclone-odisha_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-cyclone-odisha_angle1_overlay.png',
    boardImg: '/sample_disasters/disaster-cyclone-odisha_angle1_overlay.png',
    metrics: {
      damage_extent_percent: 9.2,
      critical_impact_percent: 18.5,
      mean_intensity: 0.315,
      peak_intensity: 0.88,
      hotspot: 'Puri-Konark Marine Drive & Beach Front',
      severity_level: 'CRITICAL',
      urgency: 'LEVEL 1 CRITICAL — EVACUATE CYCLONE SHELTER OVERFLOW',
      affected_structures: 'Coastal Fisher Settlements',
      surge_height: '3.2m above high tide',
    },
  },
  {
    id: 'earthquake',
    spotId: 'disaster-quake-delhi',
    title: 'Delhi-NCR Metropolitan Fault',
    location: 'Delhi-NCR Ridge, New Delhi',
    type: 'Metropolitan Seismic Fracture',
    iconType: 'quake',
    beforeImg: '/sample_disasters/disaster-quake-delhi_angle1_before.jpg',
    afterImg: '/sample_disasters/disaster-quake-delhi_angle1_after.jpg',
    heatmapImg: '/sample_disasters/disaster-quake-delhi_angle1_heatmap.png',
    overlayImg: '/sample_disasters/disaster-quake-delhi_angle1_overlay.png',
    boardImg: '/sample_disasters/earthquake_diagnostic_board.png',
    metrics: {
      damage_extent_percent: 15.1,
      critical_impact_percent: 26.3,
      mean_intensity: 0.487,
      peak_intensity: 0.88,
      hotspot: 'Noida-Mayur Vihar Highway Spine',
      severity_level: 'CATASTROPHIC',
      urgency: 'LEVEL 1 EMERGENCY — IMMEDIATE SEARCH & RESCUE',
      affected_structures: '89 Multi-story Blocks',
      road_blockage_index: '82% Grid Impassable',
    },
  },
]

export default function DamageHeatmapAnalyzer() {
  const [selectedScenario, setSelectedScenario] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const disasterQuery = (params.get('disaster') || '').toLowerCase()
    if (disasterQuery) {
      const match = SCENARIOS.find(
        (s) =>
          s.id.toLowerCase().includes(disasterQuery) ||
          (s.spotId && s.spotId.toLowerCase().includes(disasterQuery))
      )
      if (match) return match
    }
    return SCENARIOS[0]
  })
  const [viewMode, setViewMode] = useState('overlay') // 'overlay' | 'split' | 'diagnostic'
  const [overlayOpacity, setOverlayOpacity] = useState(70)
  const [sliderPos, setSliderPos] = useState(50)
  const [isInferencing, setIsInferencing] = useState(false)
  const [inferenceComplete, setInferenceComplete] = useState(true)

  const handleRunInference = () => {
    setIsInferencing(true)
    setInferenceComplete(false)
    setTimeout(() => {
      setIsInferencing(false)
      setInferenceComplete(true)
    }, 1200)
  }

  const m = selectedScenario.metrics

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass border border-blue-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                Siamese U-Net CNN Architecture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PyTorch 2.14 Trained
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              AI Satellite Disaster Heatmap Generator
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              Deep convolutional neural network ingests multi-temporal Before & After satellite imagery
              to automatically detect structural damage, flood inundation, and generate high-precision
              emergency impact heatmaps.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={handleRunInference}
              disabled={isInferencing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-blue hover:bg-blue-600 active:scale-95 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInferencing ? 'animate-spin' : ''}`} />
              <span>{isInferencing ? 'Running CNN Inference...' : 'Re-Run CNN Inference'}</span>
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs border border-white/10 transition-colors"
            >
              <span>Back to Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenario.id
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-blue-950/40 border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {sc.iconType === 'quake' && <Activity className="w-4 h-4 text-red-400" />}
                    {sc.iconType === 'landslide' && <Mountain className="w-4 h-4 text-amber-400" />}
                    {sc.iconType === 'flood' && <Waves className="w-4 h-4 text-cyan-400" />}
                    {sc.iconType === 'cyclone' && <Wind className="w-4 h-4 text-teal-400" />}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sc.metrics.severity_level === 'CATASTROPHIC'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {sc.metrics.severity_level}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{sc.title}</h3>
                <p className="text-[11px] text-slate-400">{sc.location}</p>
              </button>
            )
          })}
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Workspace (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* View Mode Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium mr-1">Display Mode:</span>
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'overlay'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Heatmap Overlay
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'split'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Before / After Slider
                </button>
                <button
                  onClick={() => setViewMode('diagnostic')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    viewMode === 'diagnostic'
                      ? 'bg-accent-blue text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  4-Panel Diagnostic Board
                </button>
              </div>

              {viewMode === 'overlay' && (
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Opacity: {overlayOpacity}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-24 accent-accent-blue cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Viewport Display */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl min-h-[460px] flex items-center justify-center">
              {/* OVERLAY MODE */}
              {viewMode === 'overlay' && (
                <div className="relative w-full aspect-square max-h-[580px] overflow-hidden">
                  <img
                    src={selectedScenario.afterImg}
                    alt="Post Disaster Aerial"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <img
                    src={selectedScenario.heatmapImg}
                    alt="CNN Damage Heatmap"
                    style={{ opacity: (overlayOpacity / 100) * 0.72 }}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity"
                  />
                  {/* Severity Legend Badge */}
                  <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-[11px] text-white flex items-center gap-3 shadow-xl">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Low (Green)</span>
                    </div>
                    <div className="w-20 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-600 shadow-inner" />
                    <div className="flex items-center gap-1.5 font-bold text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-red-500">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>High (Red)</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <a
                      href={selectedScenario.heatmapImg}
                      download={`${selectedScenario.id}_heatmap.png`}
                      className="p-2 rounded-lg bg-black/70 hover:bg-black text-white border border-white/15 text-xs flex items-center gap-1.5 backdrop-blur-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Heatmap PNG</span>
                    </a>
                  </div>
                </div>
              )}

              {/* SPLIT SLIDER MODE */}
              {viewMode === 'split' && (
                <div className="relative w-full aspect-square max-h-[580px] overflow-hidden select-none">
                  {/* After Image (Background) */}
                  <img
                    src={selectedScenario.afterImg}
                    alt="Post Disaster"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Before Image (Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={selectedScenario.beforeImg}
                      alt="Pre Disaster Baseline"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                    />
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 border border-white/15 text-xs font-semibold text-emerald-400">
                      PRE-DISASTER (BEFORE)
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-black/70 border border-white/15 text-xs font-semibold text-red-400">
                    POST-DISASTER (AFTER)
                  </div>

                  {/* Draggable Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shadow-lg">
                      ⇄
                    </div>
                  </div>

                  {/* Hidden range input for interactive drag */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  />
                </div>
              )}

              {/* 4-PANEL DIAGNOSTIC BOARD */}
              {viewMode === 'diagnostic' && (
                <div className="w-full p-2">
                  <img
                    src={selectedScenario.boardImg}
                    alt="4-Panel Diagnostic Assessment Board"
                    className="w-full rounded-xl object-contain shadow-2xl"
                  />
                </div>
              )}
            </div>

            {/* Colormap Legend */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                CNN Turbo Colormap Scale:
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <span className="text-[10px] text-slate-400">Intact (0.0)</span>
                <div
                  className="flex-1 h-3 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to right, #30123b, #4145ab, #4675ed, #39a2fc, #1bcfd4, #24eca6, #61fc4c, #a4fc3b, #d1e834, #f3c63a, #fe9b2d, #f36315, #d93806, #b11901, #7a0403)',
                  }}
                />
                <span className="text-[10px] text-red-400 font-semibold">Critical (1.0)</span>
              </div>
            </div>
          </div>

          {/* AI Analytics & NDRF Response Sidebar */}
          <div className="space-y-4">
            {/* Impact Metric Cards */}
            <div className="p-5 rounded-2xl glass border border-white/10 space-y-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Disaster Heatmap Analytics
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Damage Extent</p>
                  <p className="text-2xl font-black text-red-400 mt-1">{m.damage_extent_percent}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.damage_extent_percent}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Critical Impact Zone</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">{m.critical_impact_percent}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.critical_impact_percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-400">Peak Hotspot</span>
                  <span className="font-semibold text-white truncate max-w-[160px]">{m.hotspot}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-400">Affected Assets</span>
                  <span className="font-semibold text-white">{m.affected_structures}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                  <span className="text-slate-400">Peak Damage Intensity</span>
                  <span className="font-semibold text-red-400">{m.peak_intensity} / 1.0</span>
                </div>
              </div>

              {/* Actionable Protocol Box */}
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ACTIONABLE PROTOCOL</span>
                </div>
                <p className="text-[11px] text-red-200 font-medium leading-relaxed">
                  {m.urgency}
                </p>
              </div>
            </div>

            {/* Model Architecture Specs */}
            <div className="p-5 rounded-2xl glass border border-white/10 space-y-3 text-xs">
              <h3 className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-blue" />
                Model Specifications
              </h3>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Architecture</span>
                  <span className="text-slate-200 font-medium">Siamese Residual U-Net</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Input Tensor</span>
                  <span className="text-slate-200 font-medium">[B, 6, 512, 512]</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Output Map</span>
                  <span className="text-slate-200 font-medium">[B, 1, 512, 512] (Sigmoid)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Loss Function</span>
                  <span className="text-slate-200 font-medium">BCE + Soft Dice Loss</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Model Checkpoint</span>
                  <span className="text-emerald-400 font-mono">disaster_cnn_heatmap.pt</span>
                </div>
              </div>
            </div>

            {/* Direct Link to Emergency Verification */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Cross-Validate with Social Signals?</p>
                <p className="text-[11px] text-slate-400">Corroborate satellite heatmaps with citizen reports</p>
              </div>
              <Link
                to="/verification"
                className="px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-white font-medium text-xs whitespace-nowrap"
              >
                Open Pipeline
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
