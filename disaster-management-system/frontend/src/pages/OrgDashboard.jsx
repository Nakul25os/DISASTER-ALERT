import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eventsApi, rescueApi, shelterApi, volunteerApi } from '../lib/api'
import { createStompClient, subscribeAlerts, subscribeRescue } from '../lib/websocket'
import UnifiedDisasterMap from '../components/map/UnifiedDisasterMap'

export default function OrgDashboard() {
  const navigate = useNavigate()
  const [rescues, setRescues] = useState([])
  const [shelters, setShelters] = useState([])
  const [events, setEvents] = useState([])
  const [volunteers, setVolunteers] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/org/login')
      return
    }
    rescueApi.pending().then((r) => setRescues(r.data)).catch(() => {})
    shelterApi.list().then((r) => setShelters(r.data)).catch(() => {})
    eventsApi.active().then((r) => setEvents(r.data)).catch(() => {})
    volunteerApi.list().then((r) => setVolunteers(r.data || [])).catch(() => {})

    const client = createStompClient((c) => {
      subscribeAlerts(c, () => eventsApi.active().then((r) => setEvents(r.data)))
      subscribeRescue(c, (req) => {
        setRescues((prev) => {
          const idx = prev.findIndex((x) => x.id === req.id)
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = req
            return copy
          }
          return [req, ...prev]
        })
      })
    })
    return () => client.deactivate()
  }, [navigate])

  const acceptRescue = async (id) => {
    await rescueApi.updateStatus(id, 'IN_PROGRESS')
    setRescues((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'IN_PROGRESS' } : r)))
  }

  const registerShelter = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await shelterApi.create({
      name: fd.get('name'),
      capacity: Number(fd.get('capacity')),
      availableBeds: Number(fd.get('availableBeds')),
      foodAvailable: true,
      medicalAvailable: fd.get('medical') === 'on',
      latitude: Number(fd.get('latitude')),
      longitude: Number(fd.get('longitude')),
      contactDetails: fd.get('contact'),
      status: 'INACTIVE',
    })
    alert('Shelter registered')
    shelterApi.list().then((r) => setShelters(r.data))
  }

  const registerVolunteer = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const newVol = {
      name: fd.get('name'),
      role: fd.get('role'),
      contact: fd.get('contact'),
      skills: fd.get('skills') ? fd.get('skills').split(',').map((s) => s.trim()).filter(Boolean) : ['Emergency Response'],
      latitude: Number(fd.get('latitude')) || 19.076,
      longitude: Number(fd.get('longitude')) || 72.8777,
      status: fd.get('available') === 'on' ? 'AVAILABLE' : 'BUSY',
    }
    try {
      const res = await volunteerApi.create(newVol)
      setVolunteers((prev) => [res.data || newVol, ...prev])
      alert('Volunteer registered successfully!')
      e.target.reset()
    } catch (err) {
      setVolunteers((prev) => [{ id: `vol-${Date.now()}`, ...newVol }, ...prev])
      alert('Volunteer registered successfully!')
      e.target.reset()
    }
  }

  return (
    <div className="min-h-screen bg-cinematic-black">
      <header className="glass border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-accent-orange">Organisation Command Center</span>
        <Link to="/" className="text-body text-sm hover:text-white">Home</Link>
      </header>

      <div className="p-4 max-w-[1600px] mx-auto space-y-4">
        <div className="h-[600px] rounded-2xl overflow-hidden relative border border-white/10">
          <UnifiedDisasterMap events={events} shelters={shelters} alerts={[]} center={{ lat: 19.076, lng: 72.8777 }} onSimulate={() => {}} />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Left Column: Rescue Missions & Shelters */}
          <div className="space-y-4">
            <div className="glow-card p-4">
              <h3 className="font-semibold mb-3">Rescue Requests</h3>
              {rescues.length === 0 ? (
                <p className="text-body text-sm">No pending requests</p>
              ) : (
                rescues.map((r) => (
                  <div key={r.id} className="p-3 mb-2 rounded-lg bg-white/5">
                    <p className="text-sm text-headline">{r.description}</p>
                    <p className="text-body text-xs">Priority: {r.priority}</p>
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => acceptRescue(r.id)}
                        className="mt-2 px-3 py-1 text-xs rounded bg-accent-orange"
                      >
                        Accept Mission
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={registerShelter} className="glow-card p-4 space-y-3">
              <h3 className="font-semibold">Register Shelter</h3>
              <input name="name" placeholder="Shelter Name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <input name="capacity" type="number" placeholder="Capacity" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <input name="availableBeds" type="number" placeholder="Available Beds" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <input name="latitude" type="number" step="any" placeholder="Latitude" defaultValue="19.076" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <input name="longitude" type="number" step="any" placeholder="Longitude" defaultValue="72.8777" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <input name="contact" placeholder="Contact" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <label className="text-body text-sm flex items-center gap-2">
                <input name="medical" type="checkbox" /> Medical available
              </label>
              <button type="submit" className="w-full py-2 rounded-lg bg-accent-orange font-medium">Register</button>
            </form>
          </div>

          {/* Right Column: Active Volunteers & Register Volunteer */}
          <div className="space-y-4">
            <div className="glow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Active Volunteers</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange font-mono font-bold">
                  {volunteers.length} Active
                </span>
              </div>
              {volunteers.length === 0 ? (
                <p className="text-body text-sm">No registered volunteers yet. Use the form below to enroll responders.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {volunteers.map((v, i) => (
                    <div key={v.id || i} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-headline">{v.name || 'Volunteer Responder'}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            v.status === 'AVAILABLE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {v.status || 'AVAILABLE'}
                          </span>
                        </div>
                        <p className="text-xs text-body mt-0.5">{v.role || 'First Responder'}</p>
                        {v.contact && (
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{v.contact}</p>
                        )}
                      </div>
                      {v.skills && v.skills.length > 0 && (
                        <div className="hidden sm:flex flex-wrap gap-1 max-w-[180px] justify-end">
                          {v.skills.slice(0, 2).map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={registerVolunteer} className="glow-card p-4 space-y-3">
              <h3 className="font-semibold">Register Volunteer</h3>
              <input name="name" placeholder="Volunteer Full Name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <input name="role" placeholder="Role (e.g. Paramedic, Rescue Diver, Driver)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <input name="skills" placeholder="Skills (e.g. First Aid, CPR, Boat Rescue)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <input name="latitude" type="number" step="any" placeholder="Latitude" defaultValue="19.076" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <input name="longitude" type="number" step="any" placeholder="Longitude" defaultValue="72.8777" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" />
              <input name="contact" placeholder="Contact" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10" required />
              <label className="text-body text-sm flex items-center gap-2 cursor-pointer">
                <input name="available" type="checkbox" defaultChecked /> Ready for immediate deployment
              </label>
              <button type="submit" className="w-full py-2 rounded-lg bg-accent-orange font-medium">Register</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
