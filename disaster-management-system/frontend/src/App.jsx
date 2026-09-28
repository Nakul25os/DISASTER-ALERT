import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import OrgSignup from './pages/OrgSignup'
import OrgLogin from './pages/OrgLogin'
import OrgDashboard from './pages/OrgDashboard'
import VerificationPipelineDashboard from './pages/VerificationPipelineDashboard'
import DamageHeatmapAnalyzer from './pages/DamageHeatmapAnalyzer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/verification" element={<VerificationPipelineDashboard />} />
      <Route path="/damage-heatmap" element={<DamageHeatmapAnalyzer />} />
      <Route path="/org/signup" element={<OrgSignup />} />
      <Route path="/org/login" element={<OrgLogin />} />
      <Route path="/org/dashboard" element={<OrgDashboard />} />
    </Routes>
  )
}
