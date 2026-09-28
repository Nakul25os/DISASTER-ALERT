import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Bell, MapPin, Satellite, Users, Building2, Zap, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import EarthScrollHero from '../components/EarthScrollHero'
import UnifiedDisasterMap from '../components/map/UnifiedDisasterMap'
import { publicApi } from '../lib/api'

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 }

const features = [
  { icon: Bell, title: 'Emergency Alerts', desc: 'Realtime geo-based alerts via WebSocket and email.' },
  { icon: MapPin, title: 'Shelter Mapping', desc: 'Live shelter capacity and activation on disaster events.' },
  { icon: Users, title: 'Volunteer Coordination', desc: 'Auto-assign nearest available volunteers.' },
  { icon: Activity, title: 'Live Dashboard', desc: 'Government-grade monitoring and simulation drills.' },
  { icon: Satellite, title: 'Satellite Intelligence', desc: 'Risk overlays and affected-zone visualization.' },
  { icon: Building2, title: 'Organisation Network', desc: 'NGOs, rescue teams, and relief providers in one ecosystem.' },
]

export default function Landing() {
  const [stats, setStats] = useState(null)
  const [orgs, setOrgs] = useState([])
  const [events, setEvents] = useState([])
  const [shelters, setShelters] = useState([])

  useEffect(() => {
    publicApi.stats().then((r) => setStats(r.data)).catch(() => {})
    publicApi.organisations().then((r) => setOrgs(r.data)).catch(() => {})
    publicApi.events().then((r) => setEvents(r.data)).catch(() => {})
    publicApi.shelters().then((r) => setShelters(r.data)).catch(() => {})

    const id = setInterval(() => {
      publicApi.stats().then((r) => setStats(r.data)).catch(() => {})
      publicApi.events().then((r) => setEvents(r.data)).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div id="hero" className="bg-cinematic-black min-h-screen">
      <Navbar />
      <EarthScrollHero />

      {/* About */}
      <section id="about" className="py-32 px-4 bg-cinematic-section">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent-blue tracking-widest text-xs uppercase mb-4">About Platform</p>
          <h2 className="text-4xl md:text-6xl font-bold text-headline tracking-tight">ONE DIGITAL WORLD.</h2>
          <p className="text-body mt-6 text-lg leading-relaxed">
            Smart Disaster Alert &amp; Resource Coordination System detects, simulates, and responds to
            floods, fires, earthquakes, cyclones, and landslides through a unified event-driven pipeline.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-headline mb-16">ENTER INDIA.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glow-card p-6"
              >
                <f.icon className="w-10 h-10 text-accent-blue mb-4" />
                <h3 className="text-xl font-semibold text-headline">{f.title}</h3>
                <p className="text-body mt-2 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIFIED LIVE MAP PREVIEW ── */}
      <section id="live-map" className="py-20 px-4 bg-cinematic-section">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-accent-blue tracking-widest text-xs uppercase mb-3">Intelligence Feed</p>
            <h2 className="text-3xl md:text-5xl font-bold text-headline">Live Disaster Intelligence Map</h2>
            <p className="text-body mt-4 text-base max-w-2xl mx-auto">
              A live window into India's disaster monitoring grid — real shelters, active events,
              AI social intelligence, and rainfall overlays updating every 30 seconds.
            </p>
          </motion.div>

          {/* Stats strip above the map */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {Object.entries(stats).map(([k, v]) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="glow-card p-4 text-center"
                >
                  <p className="text-2xl font-bold text-accent-blue">{v}</p>
                  <p className="text-body text-xs mt-1 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* The Unified Map — read-only preview for landing page visitors */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_-20px_rgba(0,80,255,0.4)]"
            style={{ height: '680px' }}
          >
            <UnifiedDisasterMap
              center={DEFAULT_CENTER}
              events={events}
              shelters={shelters}
              alerts={[]}
              onSimulate={() => {}}
              readOnly={true}
            />
          </motion.div>

          {/* CTA beneath the map */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-accent-blue text-white font-semibold hover:shadow-[0_0_30px_rgba(0,80,255,0.6)] transition-shadow"
            >
              Open Full Dashboard <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/org/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/15 text-body hover:border-white/30 hover:text-white transition-colors"
            >
              Organisation Login
            </a>
          </motion.div>
        </div>
      </section>

      {/* Simulation callout */}
      <section id="simulation" className="py-24 px-4">
        <div className="max-w-4xl mx-auto glow-card p-12 text-center">
          <Zap className="w-12 h-12 text-accent-orange mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-headline">Simulation Demo</h2>
          <p className="text-body mt-4">
            Admins can trigger Flood, Fire, or Earthquake drills. The system activates shelters,
            assigns volunteers, sends emails, and updates the map in realtime.
          </p>
        </div>
      </section>

      {/* Organisations */}
      <section id="organisations" className="py-24 px-4 bg-cinematic-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-headline mb-2">Trusted Rescue Organisations</h2>
          <p className="text-body mb-10">Active teams ready for disaster coordination</p>
          <div className="grid md:grid-cols-3 gap-6">
            {orgs.map((o) => (
              <div key={o.id} className="glow-card p-6">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-headline">{o.organisationName}</h3>
                  {o.verificationBadge && (
                    <span className="text-xs px-2 py-1 rounded bg-accent-blue/20 text-accent-blue">
                      {o.verificationBadge}
                    </span>
                  )}
                </div>
                <p className="text-body text-sm mt-1">{o.city}, {o.state}</p>
                <p className="text-body text-xs mt-3">{o.supportTypes?.join(' · ')}</p>
                <span
                  className={`inline-block mt-4 text-xs px-2 py-1 rounded ${
                    o.activeStatus ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-body'
                  }`}
                >
                  {o.activeStatus ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="py-16 px-4 border-t border-white/5 text-center text-body text-sm">
        <p>Smart Disaster Alert &amp; Resource Coordination System</p>
        <p className="mt-2">HackXccelerate Demo · Event-Driven Architecture · Spring Boot + React</p>
      </footer>
    </div>
  )
}
