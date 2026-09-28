/**
 * INDIA DISASTER REGIONS — Master data file
 * All layer data (SOS beacons, safe zones, evacuation routes, flood zones, and hazard zones)
 * defined per region for the unified disaster map.
 */

export const REGIONS = {
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    center: { lat: 19.076, lng: 72.8777 },
    zoom: 11,
    primaryDisaster: "FLOOD",
    color: "#0050FF",
    icon: "FLOOD",

    sos: [
      { id: "mum-s1", lat: 19.0176, lng: 72.8562, msg: "Family of 4 stranded — roof flooding", severity: "CRITICAL", time: "2m ago" },
      { id: "mum-s2", lat: 19.0620, lng: 72.8777, msg: "Elderly resident needs evacuation", severity: "HIGH", time: "5m ago" },
      { id: "mum-s3", lat: 19.0360, lng: 72.8550, msg: "Hospital generator failure — need power", severity: "CRITICAL", time: "8m ago" },
      { id: "mum-s4", lat: 19.1020, lng: 72.8810, msg: "30+ people trapped in building", severity: "CRITICAL", time: "12m ago" },
      { id: "mum-s5", lat: 18.9890, lng: 72.8210, msg: "Medical emergency — need rescue boat", severity: "HIGH", time: "15m ago" },
      { id: "mum-s6", lat: 19.0750, lng: 72.9120, msg: "Vehicle stuck in flood waters", severity: "MEDIUM", time: "18m ago" },
      { id: "mum-s7", lat: 19.0450, lng: 72.8100, msg: "Children school bus stranded", severity: "CRITICAL", time: "22m ago" },
    ],

    safeZones: [
      { lat: 19.1136, lng: 72.8697, radius: 900, name: "Borivali National Park Zone", threat: "LOW", capacity: 5000, status: "ACTIVE" },
      { lat: 19.0450, lng: 72.8205, radius: 700, name: "Bandra Kurla Complex", threat: "LOW", capacity: 3200, status: "ACTIVE" },
      { lat: 18.9750, lng: 72.8258, radius: 600, name: "Colaba Safety Perimeter", threat: "LOW", capacity: 2800, status: "ACTIVE" },
      { lat: 19.0728, lng: 72.8826, radius: 800, name: "Kurla Assembly Zone", threat: "MEDIUM", capacity: 4100, status: "STANDBY" },
      { lat: 19.0330, lng: 72.8556, radius: 500, name: "Dharavi Relief Centre", threat: "MEDIUM", capacity: 1800, status: "ACTIVE" },
    ],

    evacuationHubs: [
      { lat: 19.1136, lng: 72.8697, name: "Borivali Relief Camp" },
      { lat: 19.0450, lng: 72.8205, name: "Bandra Kurla Safe Zone" },
      { lat: 18.9750, lng: 72.8258, name: "Colaba Assembly Point" },
      { lat: 19.0728, lng: 72.8826, name: "Kurla Evacuation Hub" },
      { lat: 19.0330, lng: 72.8556, name: "Dharavi Relief Centre" },
    ],

    evacuationSources: [
      { from: [19.0550, 72.8377], to: 0 }, { from: [19.0650, 72.8500], to: 0 },
      { from: [19.0200, 72.8300], to: 1 }, { from: [19.0100, 72.8400], to: 1 },
      { from: [18.9950, 72.8250], to: 2 }, { from: [18.9600, 72.8350], to: 2 },
      { from: [19.0800, 72.9000], to: 3 }, { from: [19.0400, 72.8700], to: 4 },
    ],

    floodZones: [
      {
        name: "Dharavi Low-Lying Basin", risk: "CRITICAL",
        coords: [[19.042,72.849],[19.048,72.856],[19.038,72.862],[19.030,72.858],[19.025,72.850],[19.032,72.843]],
        desc: "Chronic flooding — <1m above sea level", depth: "1.8–2.4m",
      },
      {
        name: "Kurla-Bhandup Creek Zone", risk: "HIGH",
        coords: [[19.068,72.882],[19.076,72.893],[19.080,72.902],[19.072,72.910],[19.062,72.900],[19.058,72.888]],
        desc: "Tidal creek overflow risk during monsoon", depth: "0.8–1.6m",
      },
      {
        name: "Colaba Shore Zone", risk: "HIGH",
        coords: [[18.908,72.815],[18.915,72.823],[18.920,72.830],[18.912,72.838],[18.905,72.830],[18.900,72.820]],
        desc: "Storm surge + high tide inundation zone", depth: "0.5–1.2m",
      },
      {
        name: "Bandra Waterfront", risk: "MEDIUM",
        coords: [[19.049,72.813],[19.055,72.820],[19.058,72.830],[19.051,72.836],[19.043,72.825],[19.040,72.815]],
        desc: "Coastal flooding during cyclonic surges", depth: "0.3–0.8m",
      },
    ],

    hazardZones: [
      {
        type: "CYCLONE",
        name: "Cyclone Kyarr Path",
        severity: "CRITICAL",
        center: { lat: 18.92, lng: 72.65 },
        radius: 12000,
        speed: "145 km/h",
        waveHeight: "4.5m",
        desc: "Active storm system tracking NNE along coast. Severe surges anticipated in Colaba and Bandra sectors.",
        path: [[18.6, 72.2], [18.8, 72.4], [19.0, 72.6], [19.2, 72.85]]
      },
      {
        type: "EARTHQUAKE",
        name: "Thane Fault Activity",
        severity: "MEDIUM",
        center: { lat: 19.18, lng: 73.04 },
        radius: 8000,
        magnitude: "4.8 SR",
        depth: "12 km",
        desc: "Tectonic adjustment detected on Kalyan-Panvel line. Minor building tremors recorded."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  kerala: {
    id: "kerala",
    name: "Kerala",
    state: "Kerala",
    center: { lat: 10.52, lng: 76.22 },
    zoom: 9,
    primaryDisaster: "FLOOD",
    color: "#00b4d8",
    icon: "FLOOD",

    sos: [
      { id: "ker-s1", lat: 9.496, lng: 76.339, msg: "Alappuzha backwaters — boat rescue needed", severity: "CRITICAL", time: "3m ago" },
      { id: "ker-s2", lat: 11.606, lng: 76.134, msg: "Wayanad landslide — 12 families cut off", severity: "CRITICAL", time: "6m ago" },
      { id: "ker-s3", lat: 9.592, lng: 76.522, msg: "Kottayam floodwaters rising — 2nd floor", severity: "HIGH", time: "9m ago" },
      { id: "ker-s4", lat: 10.525, lng: 76.214, msg: "Thrissur hospital flood — generator failing", severity: "CRITICAL", time: "14m ago" },
      { id: "ker-s5", lat: 8.524, lng: 76.936, msg: "TVM coastal surge — fishermen stranded", severity: "HIGH", time: "20m ago" },
      { id: "ker-s6", lat: 10.001, lng: 76.270, msg: "Ernakulam road cut off — 40 vehicles", severity: "MEDIUM", time: "25m ago" },
    ],

    safeZones: [
      { lat: 9.931, lng: 76.267, radius: 1200, name: "Kochi Convention Centre Camp", threat: "LOW", capacity: 8000, status: "ACTIVE" },
      { lat: 8.524, lng: 76.936, radius: 900, name: "Thiruvananthapuram Stadium", threat: "LOW", capacity: 6000, status: "ACTIVE" },
      { lat: 10.525, lng: 76.214, radius: 800, name: "Thrissur Sports Complex", threat: "MEDIUM", capacity: 4500, status: "ACTIVE" },
      { lat: 11.259, lng: 75.780, radius: 700, name: "Kozhikode Govt Camp", threat: "LOW", capacity: 3500, status: "ACTIVE" },
      { lat: 11.606, lng: 76.134, radius: 600, name: "Wayanad Highland Assembly", threat: "HIGH", capacity: 2000, status: "STANDBY" },
    ],

    evacuationHubs: [
      { lat: 9.931, lng: 76.267, name: "Kochi Central Relief Hub" },
      { lat: 8.524, lng: 76.936, name: "Thiruvananthapuram Safe Zone" },
      { lat: 10.525, lng: 76.214, name: "Thrissur Assembly Point" },
      { lat: 11.259, lng: 75.780, name: "Kozhikode Evacuation Hub" },
    ],

    evacuationSources: [
      { from: [9.496, 76.339], to: 0 }, { from: [9.592, 76.522], to: 0 },
      { from: [8.300, 76.800], to: 1 }, { from: [8.700, 76.900], to: 1 },
      { from: [10.200, 76.200], to: 2 }, { from: [10.800, 76.300], to: 2 },
      { from: [11.606, 76.134], to: 3 }, { from: [11.400, 75.900], to: 3 },
    ],

    floodZones: [
      {
        name: "Kuttanad Below Sea Level", risk: "CRITICAL",
        coords: [[9.35,76.40],[9.42,76.48],[9.38,76.55],[9.30,76.52],[9.25,76.45],[9.30,76.38]],
        desc: "Lowest agricultural land in Asia — 1.2m below sea level", depth: "2.5–3.5m",
      },
      {
        name: "Alappuzha Backwater Surge", risk: "CRITICAL",
        coords: [[9.48,76.30],[9.52,76.36],[9.50,76.42],[9.44,76.40],[9.40,76.32]],
        desc: "Backwater network inundation — monsoon peak", depth: "1.5–2.8m",
      },
      {
        name: "Chalakudy River Overflow", risk: "HIGH",
        coords: [[10.30,76.30],[10.36,76.36],[10.38,76.44],[10.32,76.48],[10.24,76.40],[10.22,76.32]],
        desc: "River swells beyond banks during heavy rainfall", depth: "0.8–1.8m",
      },
      {
        name: "Wayanad Hill Runoff Zone", risk: "HIGH",
        coords: [[11.55,76.05],[11.62,76.12],[11.66,76.20],[11.60,76.26],[11.52,76.22],[11.48,76.12]],
        desc: "Steep terrain accelerates runoff — landslide secondary risk", depth: "0.6–1.4m",
      },
    ],

    hazardZones: [
      {
        type: "LANDSLIDE",
        name: "Wayanad Slope Collapse",
        severity: "CRITICAL",
        coords: [[11.56, 76.11], [11.62, 76.13], [11.63, 76.18], [11.58, 76.17], [11.55, 76.12]],
        desc: "Extreme slope failure hazard near Meppadi triggered by 320mm cloudburst. Unstable mud deposits.",
        hazardIndex: "9.6/10"
      },
      {
        type: "CYCLONE",
        name: "Kochi-Alappuzha Coast Surge",
        severity: "HIGH",
        center: { lat: 9.60, lng: 76.15 },
        radius: 9500,
        speed: "115 km/h",
        waveHeight: "3.8m",
        desc: "Active storm system tracking parallel to Malabar coast. Heavy beach soil erosion.",
        path: [[9.2, 75.9], [9.5, 76.1], [9.8, 76.2]]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  uttarakhand: {
    id: "uttarakhand",
    name: "Uttarakhand",
    state: "Uttarakhand",
    center: { lat: 30.316, lng: 78.032 },
    zoom: 9,
    primaryDisaster: "LANDSLIDE",
    color: "#a855f7",
    icon: "LANDSLIDE",

    sos: [
      { id: "utt-s1", lat: 30.726, lng: 79.076, msg: "Badrinath road — 3 vehicles buried in landslide", severity: "CRITICAL", time: "1m ago" },
      { id: "utt-s2", lat: 30.145, lng: 78.272, msg: "Rishikesh flash flood — ghats submerged", severity: "HIGH", time: "7m ago" },
      { id: "utt-s3", lat: 29.964, lng: 78.163, msg: "Haridwar — pilgrim camp flooded", severity: "HIGH", time: "10m ago" },
      { id: "utt-s4", lat: 30.923, lng: 78.948, msg: "Yamunotri trekkers stranded — bridge washed", severity: "CRITICAL", time: "15m ago" },
      { id: "utt-s5", lat: 29.544, lng: 80.211, msg: "Pithoragarh village — landslide blocking road", severity: "CRITICAL", time: "19m ago" },
      { id: "utt-s6", lat: 30.316, lng: 78.032, msg: "Dehradun - low-lying colony waterlogged", severity: "MEDIUM", time: "28m ago" },
    ],

    safeZones: [
      { lat: 30.316, lng: 78.032, radius: 1500, name: "Dehradun Command Centre", threat: "LOW", capacity: 10000, status: "ACTIVE" },
      { lat: 29.964, lng: 78.163, radius: 800, name: "Haridwar Relief Camp", threat: "MEDIUM", capacity: 5000, status: "ACTIVE" },
      { lat: 30.145, lng: 78.272, radius: 600, name: "Rishikesh Highland Zone", threat: "MEDIUM", capacity: 3000, status: "STANDBY" },
      { lat: 29.544, lng: 80.211, radius: 500, name: "Pithoragarh Army Camp", threat: "HIGH", capacity: 2000, status: "ACTIVE" },
    ],

    evacuationHubs: [
      { lat: 30.316, lng: 78.032, name: "Dehradun Relief HQ" },
      { lat: 29.964, lng: 78.163, name: "Haridwar Safe Zone" },
      { lat: 30.145, lng: 78.272, name: "Rishikesh Assembly" },
      { lat: 29.544, lng: 80.211, name: "Pithoragarh Hub" },
    ],

    evacuationSources: [
      { from: [30.726, 79.076], to: 0 }, { from: [30.923, 78.948], to: 0 },
      { from: [29.800, 78.200], to: 1 }, { from: [30.000, 77.900], to: 1 },
      { from: [30.200, 78.400], to: 2 }, { from: [30.400, 78.600], to: 2 },
      { from: [29.544, 80.211], to: 3 }, { from: [29.700, 80.000], to: 3 },
    ],

    floodZones: [
      {
        name: "Kedarnath Valley Flash Flood", risk: "CRITICAL",
        coords: [[30.72,79.04],[30.76,79.08],[30.75,79.14],[30.70,79.16],[30.66,79.10],[30.68,79.04]],
        desc: "Glacial lake outburst flood zone — extreme debris flow", depth: "2.0–4.0m",
      },
      {
        name: "Rishikesh-Haridwar Ganga Belt", risk: "HIGH",
        coords: [[29.96,78.12],[30.02,78.16],[30.06,78.22],[30.00,78.28],[29.92,78.24],[29.88,78.16]],
        desc: "Ganga river corridor — monsoon-season inundation", depth: "1.2–2.2m",
      },
      {
        name: "Dehradun Landslide Corridor", risk: "HIGH",
        coords: [[30.28,78.00],[30.34,78.04],[30.36,78.10],[30.30,78.14],[30.24,78.10],[30.22,78.02]],
        desc: "Unstable slopes — rockfall and debris flow risk", depth: "Debris: 0.5–3m",
      },
      {
        name: "Bhagirathi River Flood Zone", risk: "MEDIUM",
        coords: [[30.90,78.92],[30.96,78.98],[30.98,79.04],[30.92,79.08],[30.84,79.02],[30.82,78.94]],
        desc: "Yamunotri river valley — seasonal flooding", depth: "0.8–1.6m",
      },
    ],

    hazardZones: [
      {
        type: "EARTHQUAKE",
        name: "Chamoli MCT Fault Slip",
        severity: "CRITICAL",
        center: { lat: 30.55, lng: 79.28 },
        radius: 18000,
        magnitude: "6.4 SR",
        depth: "10 km",
        desc: "Shallow tectonic event along Main Central Thrust. Active sequence of secondary aftershocks recorded."
      },
      {
        type: "LANDSLIDE",
        name: "NH-94 Chamba Slide Corridor",
        severity: "HIGH",
        coords: [[30.41, 78.23], [30.46, 78.25], [30.48, 78.29], [30.42, 78.27]],
        desc: "Active landslide block burying roadway sectors. Slopes remain saturated and hazardous.",
        hazardIndex: "8.9/10"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  punjab: {
    id: "punjab",
    name: "Punjab",
    state: "Punjab",
    center: { lat: 30.900, lng: 75.857 },
    zoom: 9,
    primaryDisaster: "FLOOD",
    color: "#f59e0b",
    icon: "DROUGHT",

    sos: [
      { id: "pun-s1", lat: 30.582, lng: 75.136, msg: "Ludhiana — Sutlej overbank, village cut off", severity: "CRITICAL", time: "4m ago" },
      { id: "pun-s2", lat: 31.634, lng: 74.873, msg: "Amritsar — 200 families displaced in low colony", severity: "HIGH", time: "8m ago" },
      { id: "pun-s3", lat: 30.201, lng: 74.944, msg: "Bathinda — Harike Headworks breach risk", severity: "CRITICAL", time: "11m ago" },
      { id: "pun-s4", lat: 31.099, lng: 76.268, msg: "Ropar — Ghaggar river flooding agricultural zone", severity: "HIGH", time: "16m ago" },
      { id: "pun-s5", lat: 31.320, lng: 75.575, msg: "Jalandhar outskirts — pumping stations overwhelmed", severity: "MEDIUM", time: "22m ago" },
    ],

    safeZones: [
      { lat: 30.735, lng: 76.788, radius: 1400, name: "Chandigarh Sector 17 Camp", threat: "LOW", capacity: 12000, status: "ACTIVE" },
      { lat: 31.634, lng: 74.873, radius: 900, name: "Amritsar Golden Temple Relief", threat: "LOW", capacity: 7000, status: "ACTIVE" },
      { lat: 30.900, lng: 75.857, radius: 800, name: "Ludhiana PAU Ground Camp", threat: "MEDIUM", capacity: 5500, status: "ACTIVE" },
      { lat: 31.326, lng: 75.579, radius: 700, name: "Jalandhar NIT Assembly Point", threat: "MEDIUM", capacity: 4000, status: "STANDBY" },
    ],

    evacuationHubs: [
      { lat: 30.735, lng: 76.788, name: "Chandigarh Relief HQ" },
      { lat: 31.634, lng: 74.873, name: "Amritsar Safe Zone" },
      { lat: 30.900, lng: 75.857, name: "Ludhiana Hub" },
      { lat: 31.326, lng: 75.579, name: "Jalandhar Assembly" },
    ],

    evacuationSources: [
      { from: [30.582, 75.136], to: 0 }, { from: [30.201, 74.944], to: 0 },
      { from: [31.700, 74.700], to: 1 }, { from: [31.500, 74.600], to: 1 },
      { from: [30.700, 75.700], to: 2 }, { from: [30.500, 76.000], to: 2 },
      { from: [31.099, 76.268], to: 3 }, { from: [31.200, 75.800], to: 3 },
    ],

    floodZones: [
      {
        name: "Sutlej River Flood Belt", risk: "CRITICAL",
        coords: [[30.44,75.00],[30.52,75.10],[30.58,75.20],[30.50,75.28],[30.38,75.20],[30.32,75.08]],
        desc: "Sutlej overflows — massive agricultural inundation", depth: "1.5–2.5m",
      },
      {
        name: "Harike Wetland Overflow", risk: "HIGH",
        coords: [[31.15,75.05],[31.22,75.12],[31.24,75.20],[31.18,75.26],[31.10,75.20],[31.08,75.10]],
        desc: "Beas-Sutlej confluence flooding", depth: "1.0–2.0m",
      },
      {
        name: "Ghaggar Basin Inundation", risk: "HIGH",
        coords: [[30.90,76.50],[30.98,76.58],[31.02,76.66],[30.94,76.72],[30.84,76.64],[30.82,76.54]],
        desc: "Seasonal monsoon overflow from Ghaggar river", depth: "0.8–1.4m",
      },
      {
        name: "Ropar Dam Downstream", risk: "MEDIUM",
        coords: [[31.00,76.50],[31.06,76.56],[31.10,76.64],[31.04,76.70],[30.96,76.64],[30.94,76.54]],
        desc: "Controlled release risk during high inflow", depth: "0.5–1.2m",
      },
    ],

    hazardZones: [
      {
        type: "DROUGHT",
        name: "Malwa Desertification Zone",
        severity: "HIGH",
        coords: [[30.08, 74.78], [30.35, 74.80], [30.39, 75.12], [30.10, 75.10]],
        desc: "Severe ground water depletion and soil moisture deficit (<12%). High agricultural risk.",
        moistureDeficit: "82%"
      },
      {
        type: "EARTHQUAKE",
        name: "Amritsar Fracture Rift",
        severity: "MEDIUM",
        center: { lat: 31.65, lng: 74.85 },
        radius: 6000,
        magnitude: "4.2 SR",
        depth: "24 km",
        desc: "Deep-crustal tremor felt along Punjab plains, related to Himalayan thrust stresses."
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  mizoram: {
    id: "mizoram",
    name: "Mizoram",
    state: "Mizoram",
    center: { lat: 23.727, lng: 92.717 },
    zoom: 9,
    primaryDisaster: "LANDSLIDE",
    color: "#10b981",
    icon: "LANDSLIDE",

    sos: [
      { id: "miz-s1", lat: 23.727, lng: 92.717, msg: "Aizawl — main road blocked by major landslide", severity: "CRITICAL", time: "2m ago" },
      { id: "miz-s2", lat: 24.212, lng: 92.912, msg: "Champhai — Myanmar border road collapsed", severity: "HIGH", time: "9m ago" },
      { id: "miz-s3", lat: 22.882, lng: 92.907, msg: "Lunglei — 3 houses buried in debris flow", severity: "CRITICAL", time: "13m ago" },
      { id: "miz-s4", lat: 23.481, lng: 92.956, msg: "Serchhip — bridge washed out, village isolated", severity: "HIGH", time: "18m ago" },
      { id: "miz-s5", lat: 24.090, lng: 93.353, msg: "Kolasib — flash flood sweeping bazaar area", severity: "HIGH", time: "24m ago" },
    ],

    safeZones: [
      { lat: 23.727, lng: 92.717, radius: 1000, name: "Aizawl State Capital Camp", threat: "MEDIUM", capacity: 8000, status: "ACTIVE" },
      { lat: 22.882, lng: 92.907, radius: 700, name: "Lunglei Town Hall Shelter", threat: "HIGH", capacity: 3000, status: "ACTIVE" },
      { lat: 24.212, lng: 92.912, radius: 600, name: "Champhai Border Camp", threat: "MEDIUM", capacity: 2500, status: "STANDBY" },
      { lat: 23.481, lng: 92.956, radius: 500, name: "Serchhip Relief Point", threat: "HIGH", capacity: 1500, status: "ACTIVE" },
    ],

    evacuationHubs: [
      { lat: 23.727, lng: 92.717, name: "Aizawl Central Hub" },
      { lat: 22.882, lng: 92.907, name: "Lunglei Safe Zone" },
      { lat: 24.212, lng: 92.912, name: "Champhai Assembly" },
      { lat: 23.481, lng: 92.956, name: "Serchhip Hub" },
    ],

    evacuationSources: [
      { from: [23.900, 92.600], to: 0 }, { from: [23.500, 92.500], to: 0 },
      { from: [23.000, 93.000], to: 1 }, { from: [22.700, 92.700], to: 1 },
      { from: [24.100, 93.200], to: 2 }, { from: [24.400, 93.100], to: 2 },
      { from: [23.300, 93.200], to: 3 }, { from: [23.600, 93.100], to: 3 },
    ],

    floodZones: [
      {
        name: "Aizawl Central Landslide Zone", risk: "CRITICAL",
        coords: [[23.68,92.68],[23.74,92.72],[23.77,92.74],[23.75,92.80],[23.68,92.78],[23.63,92.72]],
        desc: "Steep urban hillside — high debris flow velocity", depth: "Debris: 1–4m",
      },
      {
        name: "Tlawng River Flash Flood", risk: "HIGH",
        coords: [[23.40,92.85],[23.48,92.92],[23.52,92.98],[23.46,93.04],[23.38,92.98],[23.34,92.90]],
        desc: "Fast-flowing Tlawng river — seasonal flash flood", depth: "1.0–2.5m",
      },
      {
        name: "Lunglei Valley Debris Zone", risk: "HIGH",
        coords: [[22.84,92.86],[22.90,92.92],[22.92,92.98],[22.86,93.02],[22.80,92.96],[22.78,92.88]],
        desc: "Compounded landslide from Mizo highlands", depth: "0.8–2.0m",
      },
      {
        name: "NH-54 Landslide Corridor", risk: "CRITICAL",
        coords: [[23.65,92.60],[23.72,92.64],[23.74,92.70],[23.68,92.76],[23.60,92.72],[23.58,92.62]],
        desc: "National Highway — recurrent landslide blocks", depth: "Debris: 2–6m",
      },
    ],

    hazardZones: [
      {
        type: "EARTHQUAKE",
        name: "Indo-Myanmar Subduction Zone Slip",
        severity: "HIGH",
        center: { lat: 23.35, lng: 93.15 },
        radius: 15000,
        magnitude: "5.9 SR",
        depth: "45 km",
        desc: "Intermediate-depth compressional stress release. Tremors felt widely across Northeast India."
      },
      {
        type: "LANDSLIDE",
        name: "Bawngkawn Hillside Collapse",
        severity: "CRITICAL",
        coords: [[23.69, 92.70], [23.73, 92.71], [23.75, 92.75], [23.70, 92.74]],
        desc: "Unstable mud/shale slide blocking northern transport access. Active sliding risk during rainfall.",
        hazardIndex: "9.5/10"
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  telangana: {
    id: "telangana",
    name: "Telangana",
    state: "Telangana",
    center: { lat: 17.385, lng: 78.487 },
    zoom: 10,
    primaryDisaster: "FLOOD",
    color: "#f43f5e",
    icon: "FLOOD",

    sos: [
      { id: "tel-s1", lat: 17.385, lng: 78.487, msg: "Hyderabad — Musi river breach, old city flooded", severity: "CRITICAL", time: "3m ago" },
      { id: "tel-s2", lat: 17.988, lng: 79.598, msg: "Karimnagar — Godavari overflow, farms submerged", severity: "HIGH", time: "7m ago" },
      { id: "tel-s3", lat: 16.504, lng: 80.616, msg: "Khammam — Krishna river flooding — 500 displaced", severity: "CRITICAL", time: "12m ago" },
      { id: "tel-s4", lat: 18.459, lng: 79.153, msg: "Nizamabad — NDRF rescue needed for stranded buses", severity: "HIGH", time: "17m ago" },
      { id: "tel-s5", lat: 17.683, lng: 77.987, msg: "Narayanpet — drought-to-flood whiplash — wells overflow", severity: "MEDIUM", time: "23m ago" },
      { id: "tel-s6", lat: 17.249, lng: 80.145, msg: "Suryapet — Paleru river encroaching residential area", severity: "HIGH", time: "27m ago" },
    ],

    safeZones: [
      { lat: 17.385, lng: 78.487, radius: 1500, name: "Hyderabad Exhibition Grounds", threat: "LOW", capacity: 15000, status: "ACTIVE" },
      { lat: 17.988, lng: 79.598, radius: 900, name: "Karimnagar Collector Camp", threat: "MEDIUM", capacity: 5000, status: "ACTIVE" },
      { lat: 16.504, lng: 80.616, radius: 800, name: "Khammam Stadium Relief", threat: "HIGH", capacity: 4000, status: "ACTIVE" },
      { lat: 18.459, lng: 79.153, radius: 700, name: "Nizamabad Army Ground", threat: "LOW", capacity: 3500, status: "STANDBY" },
    ],

    evacuationHubs: [
      { lat: 17.385, lng: 78.487, name: "Hyderabad Central Hub" },
      { lat: 17.988, lng: 79.598, name: "Karimnagar Relief Point" },
      { lat: 16.504, lng: 80.616, name: "Khammam Safe Zone" },
      { lat: 18.459, lng: 79.153, name: "Nizamabad Assembly" },
    ],

    evacuationSources: [
      { from: [17.200, 78.300], to: 0 }, { from: [17.500, 78.700], to: 0 },
      { from: [17.800, 79.400], to: 1 }, { from: [18.200, 79.800], to: 1 },
      { from: [16.200, 80.400], to: 2 }, { from: [16.700, 80.800], to: 2 },
      { from: [18.600, 79.000], to: 3 }, { from: [18.200, 79.200], to: 3 },
    ],

    floodZones: [
      {
        name: "Musi River Old City Inundation", risk: "CRITICAL",
        coords: [[17.34,78.44],[17.40,78.48],[17.43,78.54],[17.38,78.58],[17.32,78.54],[17.28,78.46]],
        desc: "Historic Hyderabad low zones — flash flood in hours", depth: "1.5–2.8m",
      },
      {
        name: "Hussain Sagar Overflow Zone", risk: "HIGH",
        coords: [[17.42,78.46],[17.46,78.50],[17.48,78.56],[17.43,78.60],[17.38,78.56],[17.36,78.48]],
        desc: "City lake overflow — downstream residential flooding", depth: "0.8–1.6m",
      },
      {
        name: "Godavari Flood Plains", risk: "CRITICAL",
        coords: [[17.92,79.52],[17.98,79.60],[18.02,79.68],[17.96,79.74],[17.88,79.66],[17.84,79.56]],
        desc: "Godavari river at maximum flood capacity", depth: "2.0–3.5m",
      },
      {
        name: "Krishna Basin Submersion", risk: "HIGH",
        coords: [[16.44,80.54],[16.52,80.62],[16.56,80.70],[16.50,80.76],[16.42,80.70],[16.38,80.60]],
        desc: "Krishna river flooding agricultural delta zone", depth: "1.2–2.4m",
      },
    ],

    hazardZones: [
      {
        type: "DROUGHT",
        name: "Deccan Drylands Zone",
        severity: "HIGH",
        coords: [[16.58, 77.82], [16.88, 77.85], [16.85, 78.14], [16.60, 78.10]],
        desc: "Severe aquifer depletion and monsoonal fail. High agricultural crisis with heat indexes reaching 44°C.",
        moistureDeficit: "75%"
      },
      {
        type: "EARTHQUAKE",
        name: "Godavari Graben Rift Activity",
        severity: "MEDIUM",
        center: { lat: 17.65, lng: 80.82 },
        radius: 5000,
        magnitude: "4.5 SR",
        depth: "15 km",
        desc: "Intraplate tectonic settling along active rift basin. Mild tremors felt."
      }
    ]
  },
};

export const REGION_LIST = Object.values(REGIONS);
export const DEFAULT_REGION_ID = "mumbai";
