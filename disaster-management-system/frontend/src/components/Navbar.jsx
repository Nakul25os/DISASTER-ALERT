import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  const handleScrollNav = (e, targetId) => {
    e.preventDefault()
    setOpen(false)

    if (targetId === 'hero') {
      if (isLanding) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      }
    } else if (targetId === 'features') {
      if (isLanding) {
        const el = document.getElementById('features')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById('features')
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 200)
      }
    }
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-headline">
          <Shield className="w-6 h-6 text-accent-blue" />
          <span>DisasterAlert</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-body">
          {/* Home Button */}
          <button
            type="button"
            onClick={(e) => handleScrollNav(e, 'hero')}
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Home
          </button>

          {/* Features Button */}
          <button
            type="button"
            onClick={(e) => handleScrollNav(e, 'features')}
            className="hover:text-white transition-colors cursor-pointer text-left"
          >
            Features
          </button>

          <Link to="/verification" className="hover:text-white transition-colors">
            Verification Pipeline
          </Link>
          <Link to="/damage-heatmap" className="hover:text-white transition-colors">
            AI Damage Heatmap
          </Link>
          <Link to="/org/login" className="hover:text-accent-orange transition-colors">
            Org Login
          </Link>
          <Link to="/org/signup" className="hover:text-accent-orange transition-colors">
            Org Signup
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-full border border-white/20 hover:border-accent-blue transition-colors">
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-full bg-accent-blue text-white font-medium hover:shadow-glow transition-shadow"
          >
            Signup
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/10 p-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={(e) => handleScrollNav(e, 'hero')}
            className="text-left text-sm text-body hover:text-white"
          >
            Home
          </button>
          <button
            type="button"
            onClick={(e) => handleScrollNav(e, 'features')}
            className="text-left text-sm text-body hover:text-white"
          >
            Features
          </button>
          <Link to="/verification" onClick={() => setOpen(false)}>Verification Pipeline</Link>
          <Link to="/damage-heatmap" onClick={() => setOpen(false)}>AI Damage Heatmap</Link>
          <Link to="/org/login" onClick={() => setOpen(false)}>Org Login</Link>
          <Link to="/org/signup" onClick={() => setOpen(false)}>Org Signup</Link>
          <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
          <Link to="/signup" onClick={() => setOpen(false)}>Signup</Link>
        </div>
      )}
    </motion.nav>
  )
}
