import { Clock3, UserCircle, Bell, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GeocodeSearchBar from "./GeocodeSearchBar";

export default function CommandHeader({
  readOnly = false,
  onSelectLocation,
  selectedLocation,
  onClearLocation,
}) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Mission Lead";
  const role = localStorage.getItem("role") || "ADMIN";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="absolute top-0 left-0 w-full z-[1000] border-b border-white/10 bg-black/45 backdrop-blur-md h-16 flex items-center justify-between px-4 sm:px-6 gap-2 sm:gap-4">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-accent-blue/30 blur-xl rounded-full" />
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-accent-blue/30 to-cyan-500/10 border border-accent-blue/30">
            <Shield className="w-5 h-5 text-accent-blue" />
          </div>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-white tracking-widest uppercase">Unified Command</h1>
          {readOnly ? (
            <p className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 uppercase tracking-widest">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Live Intelligence • OpenStreetMap
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[10px] text-accent-blue/80 uppercase tracking-widest">
              <span className="w-1 h-1 rounded-full bg-accent-blue animate-pulse" />
              Global Sync Active • OpenStreetMap Live
            </p>
          )}
        </div>
      </div>

      {/* Center: Live Geocoding Search Bar */}
      <div className="flex-1 max-w-sm sm:max-w-md mx-1 sm:mx-4 flex justify-center">
        <GeocodeSearchBar
          onSelectLocation={onSelectLocation}
          selectedLocation={selectedLocation}
          onClearLocation={onClearLocation}
        />
      </div>

      {/* Right: Telemetry & User Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <Clock3 className="w-4 h-4 text-accent-blue" />
          <span className="font-mono text-xs text-white">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        
        <button className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        </button>

        {!readOnly && (
          <>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <UserCircle className="w-5 h-5 text-accent-blue" />
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-tight">{username}</p>
                <p className="text-[9px] text-accent-blue uppercase tracking-widest">{role}</p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </>
        )}

        {readOnly && (
          <a
            href="/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/30 hover:bg-accent-blue/20 transition-all"
          >
            ACCESS DASHBOARD →
          </a>
        )}
      </div>
    </div>
  );
}
