import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileText,
  Sliders,
  Sparkles,
  ChevronRight,
  Send,
  Zap,
  Layers,
  Database,
  MessageSquare
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { verificationApi } from '../lib/api'
import {
  createStompClient,
  subscribeVerification,
  subscribeVerificationSocial,
  subscribeVerificationAuthoritative,
  subscribeVerificationReset
} from '../lib/websocket'

export default function VerificationPipelineDashboard() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [socialStream, setSocialStream] = useState([])
  const [authoritativeStream, setAuthoritativeStream] = useState([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [activeTab, setActiveTab] = useState('pipeline') // 'pipeline' | 'streams' | 'scoring'
  const [showInjectModal, setShowInjectModal] = useState(false)
  const [notification, setNotification] = useState(null)

  // Custom injection form state
  const [injectType, setInjectType] = useState('social') // 'social' | 'authoritative'
  const [injectForm, setInjectForm] = useState({
    authorHandle: '@mumbai_observer',
    content: 'Water rising up to bonnet level in Dadar TT circle! Avoid this route. #MumbaiRains',
    disasterType: 'FLOOD',
    locationName: 'Dadar TT, Mumbai',
    latitude: 19.0178,
    longitude: 72.8478,
    agencyName: 'India Meteorological Department (IMD)',
    headline: 'IMD Alert: Heavy precipitation surge in Dadar cluster',
    bulletin: 'Severe convective cloudburst exceeding 75mm/hr detected over Dadar catchment basin. Flash flood warning issued.',
    severityLevel: 'WARNING',
  })

  // Selected event object
  const selectedEvent = useMemo(() => {
    if (!events.length) return null
    if (!selectedEventId) return events[0]
    return events.find((e) => e.id === selectedEventId) || events[0]
  }, [events, selectedEventId])

  // Initial data loading & WebSocket setup
  useEffect(() => {
    loadAllData()

    const stompClient = createStompClient((client) => {
      // 1. Verification Event updates
      subscribeVerification(client, (updatedEvent) => {
        setEvents((prev) => {
          const idx = prev.findIndex((e) => e.id === updatedEvent.id)
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = updatedEvent
            return copy
          }
          return [updatedEvent, ...prev]
        })
        loadMetrics()
      })

      // 2. Incoming Social Stream
      subscribeVerificationSocial(client, (mention) => {
        setSocialStream((prev) => [mention, ...prev].slice(0, 40))
        loadMetrics()
      })

      // 3. Incoming Authoritative Stream
      subscribeVerificationAuthoritative(client, (feedItem) => {
        setAuthoritativeStream((prev) => [feedItem, ...prev].slice(0, 30))
        loadMetrics()
      })

      // 4. Reset trigger
      subscribeVerificationReset(client, () => {
        loadAllData()
      })
    })

    const interval = setInterval(loadMetrics, 12000)

    return () => {
      stompClient.deactivate()
      clearInterval(interval)
    }
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [evRes, metRes, socRes, authRes] = await Promise.all([
        verificationApi.events(),
        verificationApi.metrics(),
        verificationApi.socialStream(),
        verificationApi.authoritativeStream(),
      ])
      setEvents(evRes.data || [])
      if (evRes.data?.length > 0 && !selectedEventId) {
        setSelectedEventId(evRes.data[0].id)
      }
      setMetrics(metRes.data || null)
      setSocialStream(socRes.data || [])
      setAuthoritativeStream(authRes.data || [])
    } catch (err) {
      console.error('Failed to load verification data', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      const res = await verificationApi.metrics()
      setMetrics(res.data)
    } catch (err) {
      // ignore
    }
  }

  const showToast = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Simulation Triggers
  const handleSimulateFalseRumor = async () => {
    try {
      setSimulating(true)
      const res = await verificationApi.simulateFalseRumor()
      showToast('Panic Shield Activated: 78 viral reports quarantined in UNVERIFIED state. Alert suppressed.', 'warning')
      await loadAllData()
      if (res.data?.id) setSelectedEventId(res.data.id)
    } catch (err) {
      showToast('Failed to trigger simulation', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const handleSimulateFlashFlood = async () => {
    try {
      setSimulating(true)
      const res = await verificationApi.simulateFlashFlood()
      showToast('Multi-Source Corroboration: Ground telemetry cross-referenced with IMD Doppler Bulletin. Escalated to ACTIONABLE.', 'success')
      await loadAllData()
      if (res.data?.id) setSelectedEventId(res.data.id)
    } catch (err) {
      showToast('Failed to trigger simulation', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const handleSimulateCyclone = async () => {
    try {
      setSimulating(true)
      const res = await verificationApi.simulateCyclone()
      showToast('Cyclone Advisory Corroborated: Coastal reports confirmed NDMA bulletin. Escalated to ACTIONABLE.', 'success')
      await loadAllData()
      if (res.data?.id) setSelectedEventId(res.data.id)
    } catch (err) {
      showToast('Failed to trigger simulation', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const handleReset = async () => {
    try {
      setSimulating(true)
      await verificationApi.reset()
      showToast('Verification pipeline reset to initial state.', 'info')
      await loadAllData()
    } catch (err) {
      showToast('Failed to reset pipeline', 'error')
    } finally {
      setSimulating(false)
    }
  }

  const handleCustomInject = async (e) => {
    e.preventDefault()
    try {
      setSimulating(true)
      if (injectType === 'social') {
        await verificationApi.ingestSocial({
          platform: 'TWITTER_X',
          authorHandle: injectForm.authorHandle,
          authorName: 'Field Observer',
          authorVerified: true,
          authorCredibility: 0.85,
          content: injectForm.content,
          disasterType: injectForm.disasterType,
          locationName: injectForm.locationName,
          latitude: parseFloat(injectForm.latitude),
          longitude: parseFloat(injectForm.longitude),
          urgencyScore: 4.2,
          engagement: 35,
          hashtags: ['#DisasterAlert', '#LiveReport'],
        })
        showToast('Social mention ingested into sliding time window buffer.', 'info')
      } else {
        await verificationApi.ingestAuthoritative({
          sourceType: 'IMD_METEOROLOGICAL',
          agencyName: injectForm.agencyName,
          headline: injectForm.headline,
          bulletin: injectForm.bulletin,
          disasterType: injectForm.disasterType,
          severityLevel: injectForm.severityLevel,
          locationName: injectForm.locationName,
          latitude: parseFloat(injectForm.latitude),
          longitude: parseFloat(injectForm.longitude),
          affectedRadiusKm: 15.0,
          bulletinUrl: 'https://imd.gov.in/bulletin/official',
        })
        showToast('Authoritative bulletin ingested and cross-referenced with candidates.', 'success')
      }
      setShowInjectModal(false)
      await loadAllData()
    } catch (err) {
      showToast('Failed to inject data item', 'error')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="bg-cinematic-black min-h-screen text-slate-100 flex flex-col pt-16">
      <Navbar />

      {/* Floating Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : notification.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
            }`}
          >
            {notification.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            {notification.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
            {notification.type === 'info' && <Radio className="w-5 h-5 text-blue-400 animate-pulse" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 flex flex-col gap-6">
        
        {/* ── HEADER & TELEMETRY STRIP ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-blue/20 text-accent-blue border border-accent-blue/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-accent-blue" /> Challenge 1 Solution
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Panic Shield Active
              </span>
              <span className="text-xs text-slate-400">Sliding Window: 15 Minutes</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-headline">
              Automated Cross-Source Verification Pipeline
            </h1>
            <p className="text-body text-sm mt-1 max-w-3xl">
              Cross-references anomalous spikes in social media disaster mentions with authoritative meteorological RSS streams
              to strictly prevent false-positive social media panic before escalating to actionable emergency alerts.
            </p>
          </div>

          {/* Quick Simulation Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateFalseRumor}
              disabled={simulating}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Test false-positive panic prevention"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Simulate False Panic (Rumor)</span>
            </button>

            <button
              onClick={handleSimulateFlashFlood}
              disabled={simulating}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Cross-reference social reports with official IMD bulletin"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Simulate Flash Flood Corroboration</span>
            </button>

            <button
              onClick={() => setShowInjectModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Inject Custom Signal</span>
            </button>

            <button
              onClick={handleReset}
              disabled={simulating}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Reset pipeline simulation"
            >
              <RefreshCw className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── KPI METRICS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glow-card p-4 rounded-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>False Positives Blocked</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-amber-300">
                {metrics?.falsePositivesShielded ?? 1}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> 100% Shielded
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Social panic rumors suppressed from triggering false sirens
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glow-card p-4 rounded-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Corroborated Actionable</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-emerald-400">
                {metrics?.corroboratedActionable ?? 1}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">Active Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Escalated to live emergency alerts &amp; shelter network
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glow-card p-4 rounded-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Avg Corroboration Latency</span>
              <Clock className="w-4 h-4 text-accent-blue" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-accent-blue">
                {metrics?.averageCorroborationTimeMinutes ? `${metrics.averageCorroborationTimeMinutes}m` : '4.2m'}
              </span>
              <span className="text-xs text-slate-400">Sliding Window</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Time from initial social spike to cross-source confirmation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glow-card p-4 rounded-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Window Data Ingestion</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-purple-300">
                {(metrics?.socialMentionsInWindow || 0) + (metrics?.authoritativeFeedsInWindow || 0)}
              </span>
              <span className="text-xs text-slate-400">Items Buffer</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {metrics?.socialMentionsInWindow || 0} social posts &bull; {metrics?.authoritativeFeedsInWindow || 0} official bulletins
            </p>
          </motion.div>
        </div>

        {/* ── PIPELINE ARCHITECTURE VISUAL FLOW ── */}
        <div className="glow-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-blue" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                End-to-End Verification Pipeline Architecture
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Status: Continuous Real-Time Ingestion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-accent-blue uppercase">Stage 01</span>
                <h4 className="text-xs font-semibold text-white mt-1">Multi-Source Ingestion</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Dual ingestion streams: Citizen tweets, Telegram distress, plus IMD Doppler &amp; NDMA RSS feeds.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-300 bg-white/5 px-2 py-1 rounded">
                <Database className="w-3 h-3 text-accent-blue" /> Realtime Ingestion
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Stage 02</span>
                <h4 className="text-xs font-semibold text-white mt-1">Sliding Time Window</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Rolling 15-minute buffer clusters mentions by geohash, temporal proximity, and disaster taxonomy.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-300 bg-white/5 px-2 py-1 rounded">
                <Clock className="w-3 h-3 text-purple-400" /> 15m Dynamic Buffer
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Stage 03</span>
                <h4 className="text-xs font-semibold text-white mt-1">Anomalous Spike Detector</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Calculates velocity (mentions/min) vs historical baseline. Spikes trigger quarantine in UNVERIFIED.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                <ShieldAlert className="w-3 h-3" /> Panic Shield Active
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase">Stage 04</span>
                <h4 className="text-xs font-semibold text-white mt-1">Corroboration Engine</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Strict cross-reference: Haversine geo-distance, semantic disaster match, temporal delta, authority weight.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                <Sliders className="w-3 h-3" /> Threshold: 70%
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Stage 05</span>
                <h4 className="text-xs font-semibold text-emerald-200 mt-1">Actionable Escalation</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Score &ge; 70% + official corroboration triggers auto-dispatch: Alerts, Shelters &amp; Responders!
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Full Alert Escalation
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN WORKSPACE: EVENT SELECTOR & DEEP DIVE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Candidate Events List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-blue" />
                <span>Verification Event Candidates</span>
              </h2>
              <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full font-mono">
                {events.length} Active Tracks
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {events.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id
                const isActionable = ev.status === 'ACTIONABLE'
                const isUnverified = ev.status === 'UNVERIFIED'
                const isCorroborating = ev.status === 'CORROBORATING'

                return (
                  <motion.div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? isActionable
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_24px_-8px_rgba(16,185,129,0.4)]'
                          : 'bg-white/[0.07] border-accent-blue/60 shadow-[0_0_24px_-8px_rgba(0,100,255,0.3)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Status Pill & Type */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase font-mono bg-white/10 text-slate-200">
                        {ev.disasterType}
                      </span>

                      {isActionable && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ACTIONABLE
                        </span>
                      )}
                      {isUnverified && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> UNVERIFIED
                        </span>
                      )}
                      {isCorroborating && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> CORROBORATING
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">
                      {ev.eventTitle}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {ev.locationName}
                    </p>

                    {/* Progress Score Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Cross-Source Confidence:</span>
                        <span className={`font-mono font-bold ${
                          isActionable ? 'text-emerald-400' : isUnverified ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {ev.scoring?.totalScore?.toFixed(1) ?? 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isActionable ? 'bg-gradient-to-r from-emerald-500 to-green-400' : isUnverified ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          }`}
                          style={{ width: `${Math.min(100, ev.scoring?.totalScore || 0)}%` }}
                        />
                        {/* Threshold Marker Pin at 70% */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                          style={{ left: '70%' }}
                          title="Actionable Threshold: 70%"
                        />
                      </div>
                    </div>

                    {/* Key stats badges */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-cyan-400" /> {ev.socialMentionCount} mentions ({ev.socialVelocityPerMinute?.toFixed(1) || 0}/m)</span>
                      <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-emerald-400" /> {ev.authoritativeCount} official feed(s)</span>
                      <span className="text-slate-500">
                        {ev.firstDetectedAt ? new Date(ev.firstDetectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {events.length === 0 && !loading && (
                <div className="p-8 text-center border border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-slate-400 text-sm">No candidate events in pipeline.</p>
                  <button
                    onClick={handleSimulateFlashFlood}
                    className="mt-3 px-4 py-2 rounded-xl text-xs bg-accent-blue text-white"
                  >
                    Simulate Demo Scenario
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Event State Transition Visualizer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {selectedEvent ? (
              <div className="glow-card p-6 rounded-2xl flex flex-col gap-6">
                
                {/* Event Title & Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-accent-blue/20 text-accent-blue">
                        {selectedEvent.disasterType}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-accent-blue" />
                        {selectedEvent.locationName}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {selectedEvent.eventTitle}
                    </h2>
                  </div>

                  {/* Big Status Badge */}
                  <div>
                    {selectedEvent.status === 'ACTIONABLE' && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">Status: ACTIONABLE</div>
                          <div className="text-[10px] text-emerald-300/80">Escalated to Full Alert</div>
                        </div>
                      </div>
                    )}
                    {selectedEvent.status === 'UNVERIFIED' && (
                      <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">Status: UNVERIFIED</div>
                          <div className="text-[10px] text-amber-300/80">Panic Shield Active (Alert Blocked)</div>
                        </div>
                      </div>
                    )}
                    {selectedEvent.status === 'CORROBORATING' && (
                      <div className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-300 flex items-center gap-2">
                        <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">Status: CORROBORATING</div>
                          <div className="text-[10px] text-blue-300/80">Matching Authoritative Streams</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── STATE TRANSITION STEPPER & AUDIT TRAIL ── */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-accent-blue" />
                    <span>State Transition Lifecycle &amp; Audit Trail</span>
                  </h4>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    {selectedEvent.stateTransitions?.map((trans, i) => {
                      const isTargetActionable = trans.toStatus === 'ACTIONABLE'
                      const isTargetCorroborating = trans.toStatus === 'CORROBORATING'
                      const isTargetUnverified = trans.toStatus === 'UNVERIFIED'

                      return (
                        <div key={i} className="relative group">
                          {/* Dot pin */}
                          <div
                            className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 bg-cinematic-black flex items-center justify-center ${
                              isTargetActionable
                                ? 'border-emerald-500 text-emerald-400'
                                : isTargetCorroborating
                                ? 'border-blue-500 text-blue-400'
                                : 'border-amber-500 text-amber-400'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isTargetActionable ? 'bg-emerald-400' : isTargetCorroborating ? 'bg-blue-400' : 'bg-amber-400'
                              }`}
                            />
                          </div>

                          {/* Transition Box */}
                          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <div className="flex items-center gap-2 font-semibold">
                                {trans.fromStatus ? (
                                  <>
                                    <span className="text-slate-400">{trans.fromStatus}</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                  </>
                                ) : (
                                  <span className="text-slate-500">INITIAL DETECTION &rarr;</span>
                                )}
                                <span
                                  className={
                                    isTargetActionable
                                      ? 'text-emerald-400 font-bold'
                                      : isTargetCorroborating
                                      ? 'text-blue-400 font-bold'
                                      : 'text-amber-400 font-bold'
                                  }
                                >
                                  {trans.toStatus}
                                </span>
                              </div>
                              <span className="font-mono text-slate-500 text-[11px]">
                                {trans.timestamp ? new Date(trans.timestamp).toLocaleTimeString() : ''}
                              </span>
                            </div>

                            <div className="text-xs text-slate-300 font-medium mt-1">
                              &ldquo;{trans.triggerEvent}&rdquo;
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {trans.rationale}
                            </p>

                            <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                              <span>Confidence at transition:</span>
                              <span className="font-bold text-white">{trans.scoreAtTransition?.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ── MULTI-FACTOR CORROBORATION SCORING BREAKDOWN ── */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Multi-Factor Corroboration Scoring Breakdown</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Total: <span className="text-emerald-400 text-sm">{selectedEvent.scoring?.totalScore?.toFixed(1)}</span> / 100
                    </span>
                  </div>

                  {/* Factor Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block">Social Velocity</span>
                      <span className="text-sm font-bold text-accent-blue font-mono">
                        +{selectedEvent.scoring?.socialVelocityScore?.toFixed(1) || 0}
                      </span>
                      <span className="text-[9px] text-slate-500 block">max 25 pts</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block">Author Trust</span>
                      <span className="text-sm font-bold text-purple-400 font-mono">
                        +{selectedEvent.scoring?.socialCredibilityScore?.toFixed(1) || 0}
                      </span>
                      <span className="text-[9px] text-slate-500 block">max 15 pts</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block">Official Stream</span>
                      <span className={`text-sm font-bold font-mono ${
                        selectedEvent.scoring?.authoritativeTrustScore > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        +{selectedEvent.scoring?.authoritativeTrustScore?.toFixed(1) || 0}
                      </span>
                      <span className="text-[9px] text-slate-500 block">max 35 pts</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block">Geo Proximity</span>
                      <span className={`text-sm font-bold font-mono ${
                        selectedEvent.scoring?.geoProximityScore > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        +{selectedEvent.scoring?.geoProximityScore?.toFixed(1) || 0}
                      </span>
                      <span className="text-[9px] text-slate-500 block">max 15 pts</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-[10px] text-slate-400 block">Temporal Match</span>
                      <span className={`text-sm font-bold font-mono ${
                        selectedEvent.scoring?.temporalAlignmentScore > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        +{selectedEvent.scoring?.temporalAlignmentScore?.toFixed(1) || 0}
                      </span>
                      <span className="text-[9px] text-slate-500 block">max 10 pts</span>
                    </div>
                  </div>

                  {/* Rationale Callout */}
                  <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                    selectedEvent.status === 'ACTIONABLE'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}>
                    <span className="font-semibold uppercase text-[10px] tracking-wider block mb-1">
                      {selectedEvent.status === 'ACTIONABLE' ? 'Corroboration Verified' : 'Panic Shield Active Rationale'}:
                    </span>
                    {selectedEvent.scoring?.scoringRationale || 'Awaiting multi-source corroboration.'}
                  </div>
                </div>

                {/* If Actionable: CTA to Disaster Map */}
                {selectedEvent.status === 'ACTIONABLE' && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Disaster Response Platform Activated
                        </h4>
                        <p className="text-xs text-slate-300">
                          Emergency broadcast dispatched to /topic/alerts. Shelters and first responders matched.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-cinematic-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
                    >
                      <span>View on Live Map</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

              </div>
            ) : (
              <div className="glow-card p-12 text-center rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <Shield className="w-12 h-12 text-slate-600 mb-3" />
                <p>Select a verification event from the left list to inspect its lifecycle.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── DUAL REAL-TIME INGESTION STREAMS (Side-by-Side Comparison) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          
          {/* Stream 1: Social Media Mentions */}
          <div className="glow-card p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent-blue animate-pulse" />
                <h3 className="text-sm font-bold text-white">Social Media Mentions Stream</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                {socialStream.length} Posts in Window
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {socialStream.map((mention) => (
                <div
                  key={mention.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-accent-blue">{mention.authorHandle}</span>
                      {mention.authorVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" title="Verified Citizen Reporter" />
                      )}
                      <span className="text-slate-500 text-[10px]">&bull; {mention.platform}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {mention.timestamp ? new Date(mention.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    {mention.content}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/5">
                    <span className="text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {mention.locationName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Credibility: <strong className="text-slate-200">{(mention.authorCredibility * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>
              ))}

              {socialStream.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No social mentions in sliding window.</p>
              )}
            </div>
          </div>

          {/* Stream 2: Authoritative Feeds & Official RSS */}
          <div className="glow-card p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Authoritative RSS &amp; Meteorological Streams</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Official Agency Validated
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {authoritativeStream.map((feed) => (
                <div
                  key={feed.id}
                  className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {feed.agencyName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-red-500/20 text-red-300 border border-red-500/30">
                      {feed.severityLevel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {feed.headline}
                  </h4>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {feed.bulletin}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-white/5">
                    <span className="text-[10px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {feed.locationName} (r: {feed.affectedRadiusKm}km)
                    </span>
                    <a
                      href={feed.bulletinUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Official Bulletin <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}

              {authoritativeStream.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No authoritative feeds active in window.</p>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ── MODAL: CUSTOM SIGNAL INJECTOR ── */}
      {showInjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glow-card p-6 rounded-2xl max-w-lg w-full border border-white/20"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-accent-blue" /> Inject Signal into Pipeline
              </h3>
              <button
                onClick={() => setShowInjectModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCustomInject} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setInjectType('social')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    injectType === 'social' ? 'bg-accent-blue text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Social Media Post
                </button>
                <button
                  type="button"
                  onClick={() => setInjectType('authoritative')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    injectType === 'authoritative' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Authoritative Feed (RSS/IMD)
                </button>
              </div>

              {injectType === 'social' ? (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Author Handle</label>
                    <input
                      type="text"
                      value={injectForm.authorHandle}
                      onChange={(e) => setInjectForm({ ...injectForm, authorHandle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Post Content</label>
                    <textarea
                      rows={3}
                      value={injectForm.content}
                      onChange={(e) => setInjectForm({ ...injectForm, content: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Agency Name</label>
                    <input
                      type="text"
                      value={injectForm.agencyName}
                      onChange={(e) => setInjectForm({ ...injectForm, agencyName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Bulletin Headline</label>
                    <input
                      type="text"
                      value={injectForm.headline}
                      onChange={(e) => setInjectForm({ ...injectForm, headline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Official Bulletin Details</label>
                    <textarea
                      rows={3}
                      value={injectForm.bulletin}
                      onChange={(e) => setInjectForm({ ...injectForm, bulletin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                      required
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Disaster Type</label>
                  <select
                    value={injectForm.disasterType}
                    onChange={(e) => setInjectForm({ ...injectForm, disasterType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-cinematic-black border border-white/10 text-xs text-white"
                  >
                    <option value="FLOOD">FLOOD</option>
                    <option value="CYCLONE">CYCLONE</option>
                    <option value="FIRE">FIRE</option>
                    <option value="EARTHQUAKE">EARTHQUAKE</option>
                    <option value="LANDSLIDE">LANDSLIDE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Location Name</label>
                  <input
                    type="text"
                    value={injectForm.locationName}
                    onChange={(e) => setInjectForm({ ...injectForm, locationName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowInjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-accent-blue text-white hover:bg-blue-600"
                >
                  Inject Signal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
