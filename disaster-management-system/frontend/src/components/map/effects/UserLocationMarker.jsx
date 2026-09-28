import { Marker } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

export default function UserLocationMarker({ position }) {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    // Create a custom icon with the cyan radar ping CSS class
    const customIcon = L.divIcon({
      className: "bg-transparent border-0 pointer-events-none",
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center pointer-events-none">
          <div class="absolute inset-0 bg-cyan-400 rounded-full opacity-30 animate-ping pointer-events-none" style="animation-duration: 2s;"></div>
          <div class="relative w-3 h-3 bg-cyan-400 border-2 border-white rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none"></div>
          <div class="absolute -bottom-6 w-24 text-center -ml-8 text-[10px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-md pointer-events-none">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    setIcon(customIcon);
  }, []);

  if (!position || !icon) return null;

  return <Marker position={position} icon={icon} interactive={false} />;
}
