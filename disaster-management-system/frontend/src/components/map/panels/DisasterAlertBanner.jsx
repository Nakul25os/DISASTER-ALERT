import { AlertOctagon, ShieldAlert, CheckCircle, Eye } from "lucide-react";

export default function DisasterAlertBanner({ activeDisaster, onResolve, onInspectDamage }) {
  if (!activeDisaster) return null;

  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const getSeverityColor = (severity) => {
    if (severity >= 8) return "from-red-600 to-red-900 border-red-500 text-red-100";
    if (severity >= 5) return "from-orange-600 to-orange-900 border-orange-500 text-orange-100";
    return "from-yellow-600 to-yellow-900 border-yellow-500 text-yellow-100";
  };

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl z-[1001] transition-all duration-500 ease-out animate-[slideDown_0.5s_ease-out]">
      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.8); }
        }
      `}</style>
      <div 
        className={`flex items-center justify-between p-4 rounded-2xl border bg-gradient-to-r ${getSeverityColor(activeDisaster.severity)} backdrop-blur-md shadow-2xl gap-3`}
        style={{ animation: "pulseGlow 2.5s infinite" }}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/20 animate-pulse">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded">
                {activeDisaster.disasterType} CRITICAL ALERT
              </span>
              <span className="text-xs font-semibold bg-red-500/40 px-2 py-0.5 rounded">
                Severity: {activeDisaster.severity}/10
              </span>
            </div>
            <h3 className="text-sm font-bold mt-1 text-white truncate">{activeDisaster.location}</h3>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{activeDisaster.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onInspectDamage && onInspectDamage(activeDisaster)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">ANALYZE DAMAGE</span>
            <span className="sm:hidden">HEATMAP</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onResolve(activeDisaster.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 hover:bg-green-500/40 text-green-300 border border-green-500/30 text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>RESOLVE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
