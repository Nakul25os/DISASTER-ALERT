import { AlertTriangle, MapPin, Shield } from "lucide-react";

const isNdma = (alert) =>
  alert.source === "SACHET_NDMA" || alert.sourceUrl?.includes("sachet");

export default function AlertStreamBar({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  const renderAlert = (alert, keyPrefix) => {
    const ndma = isNdma(alert);
    return (
      <div
        key={`${keyPrefix}-${alert.id}`}
        className="flex items-center gap-3 mx-8 text-sm"
      >
        {/* NDMA Official badge */}
        {ndma && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/25 border border-teal-400/60 text-teal-300 text-[10px] font-black tracking-widest uppercase whitespace-nowrap shrink-0">
            <Shield className="w-2.5 h-2.5" />
            NDMA OFFICIAL
          </span>
        )}

        {/* Disaster type tag */}
        <span
          className={`font-bold ${ndma ? "text-teal-400" : "text-red-400"}`}
        >
          [{alert.disasterType || "SYS_ALERT"}]
        </span>

        {/* Alert message */}
        <span className="text-white/80 truncate max-w-[380px]">
          {alert.message}
        </span>

        {/* State/location row */}
        <div className="flex items-center gap-1 opacity-60 shrink-0">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">
            {ndma && alert.state
              ? `${alert.state}, India`
              : alert.location}
          </span>
        </div>

        {/* Official severity pill (SACHET only) */}
        {ndma && alert.officialSeverity && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
              alert.officialSeverity === "HIGH"
                ? "bg-red-600/40 text-red-300 border border-red-500/50"
                : alert.officialSeverity === "MEDIUM"
                ? "bg-amber-600/40 text-amber-300 border border-amber-500/50"
                : "bg-slate-600/40 text-slate-300 border border-slate-500/40"
            }`}
          >
            {alert.officialSeverity}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="absolute bottom-0 left-0 w-full h-10 bg-red-900/40 backdrop-blur-xl border-t border-red-500/30 flex items-center z-[1000] overflow-hidden">
      {/* Left label badge */}
      <div className="flex-shrink-0 px-4 h-full bg-red-600 flex items-center justify-center gap-2 z-10 shadow-[20px_0_20px_rgba(220,38,38,0.5)]">
        <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
        <span className="font-black tracking-widest text-white text-xs">
          LIVE ALERTS
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="flex whitespace-nowrap animate-[tickerScroll_280s_linear_infinite] hover:[animation-play-state:paused] cursor-default">
          {alerts.map((alert, i) => renderAlert(alert, `a-${i}`))}
          {/* Duplicate for seamless loop */}
          {alerts.map((alert, i) => renderAlert(alert, `b-${i}`))}
        </div>
      </div>
    </div>
  );
}
