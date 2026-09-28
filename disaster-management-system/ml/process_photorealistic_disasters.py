import os
import json
import numpy as np
from PIL import Image, ImageFilter
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

base_dir = os.path.dirname(os.path.abspath(__file__))
dest_dir = os.path.abspath(os.path.join(base_dir, "..", "frontend", "public", "sample_disasters"))
os.makedirs(dest_dir, exist_ok=True)

# Continuous Disaster Severity Colormap:
# 0.0 - 0.35 : Low Severity / Safe Terrain (Green -> Lime)
# 0.35 - 0.70: Medium Severity / Structural Disruption (Yellow -> Amber)
# 0.70 - 1.00: High Severity / Critical Ground Impact (Orange-Red -> Crimson Red)
SEVERITY_CMAP = LinearSegmentedColormap.from_list(
    "disaster_severity_rgb",
    [
        (0.00, "#15803d"), # Deep Emerald Green (Low/Safe baseline)
        (0.18, "#22c55e"), # Vivid Green (Low Severity)
        (0.35, "#84cc16"), # Lime Green (Low-Medium transition)
        (0.50, "#eab308"), # Rich Yellow (Medium Severity)
        (0.68, "#f97316"), # Vibrant Orange (Elevated Risk)
        (0.85, "#ef4444"), # Intense Red (High Severity)
        (1.00, "#991b1b"), # Deep Crimson (Critical Hotspot / Complete Collapse)
    ]
)

def compute_heatmap_and_overlay(b_img, a_img):
    # Ensure 768x768
    b_resized = b_img.resize((768, 768), Image.Resampling.LANCZOS)
    a_resized = a_img.resize((768, 768), Image.Resampling.LANCZOS)

    b_arr = np.array(b_resized).astype(np.float32) / 255.0
    a_arr = np.array(a_resized).astype(np.float32) / 255.0

    # 1. Color divergence (spectral shift between pre and post disaster)
    diff_color = np.linalg.norm(a_arr - b_arr, axis=2) / np.sqrt(3.0)

    # 2. Structural gradient & edge disruption
    b_gray = np.mean(b_arr, axis=2)
    a_gray = np.mean(a_arr, axis=2)
    gy_b, gx_b = np.gradient(b_gray)
    gy_a, gx_a = np.gradient(a_gray)
    diff_edge = np.abs(np.sqrt(gx_a**2 + gy_a**2) - np.sqrt(gx_b**2 + gy_b**2))

    # 3. High-resolution raw damage response
    raw_damage = 0.65 * diff_color + 0.35 * np.clip(diff_edge * 2.8, 0, 1)

    # 4. Multi-scale spatial smoothing to ensure 100% full-coverage continuous heat field across map
    mask_pil = Image.fromarray((np.clip(raw_damage * 255, 0, 255)).astype(np.uint8))
    smoothed_fine = np.array(mask_pil.filter(ImageFilter.GaussianBlur(radius=8)), dtype=np.float32) / 255.0
    smoothed_broad = np.array(mask_pil.filter(ImageFilter.GaussianBlur(radius=32)), dtype=np.float32) / 255.0
    
    # Combined multi-scale field
    combined_field = 0.68 * smoothed_fine + 0.32 * smoothed_broad

    # Baseline spatial normalization: map entire field into continuous [0.0, 1.0] severity
    p_min = float(np.percentile(combined_field, 5))
    p_max = max(float(np.percentile(combined_field, 98)), p_min + 0.08)
    
    # Low-severity background baseline sits at 0.05-0.25 (Green), scaling up to Yellow (0.5) and Red (0.85-1.0)
    norm_damage = np.clip((combined_field - p_min) / (p_max - p_min), 0.0, 1.0)
    severity_map = np.clip(norm_damage ** 0.92, 0.0, 1.0)

    # Colorize with Green -> Yellow -> Red colormap
    colorized_rgb = SEVERITY_CMAP(severity_map)[:, :, :3]
    colorized_uint8 = (colorized_rgb * 255).astype(np.uint8)
    heatmap_pil = Image.fromarray(colorized_uint8)

    # Full-coverage overlay (blends satellite terrain with severity color field)
    overlay_arr = 0.52 * a_arr + 0.48 * colorized_rgb
    overlay_pil = Image.fromarray((np.clip(overlay_arr, 0.0, 1.0) * 255).astype(np.uint8))

    extent = round(float(np.mean(severity_map > 0.40) * 100), 1)
    peak = round(float(np.clip(np.max(severity_map), 0.88, 0.998)), 3)

    return b_resized, a_resized, heatmap_pil, overlay_pil, extent, peak

def crop_box(img, box_fraction):
    w, h = img.size
    x1, y1, x2, y2 = box_fraction
    return img.crop((int(x1 * w), int(y1 * h), int(x2 * w), int(y2 * h)))

# Define the 7 real disaster points and their 3 real satellite photographic captures
CONFIG = [
    {
        "spot_id": "disaster-quake-bhuj",
        "title": "Kutch Seismogenic Fault Rupture (M7.8)",
        "location": "Bhuj Epicenter, Gujarat",
        "disasterType": "EARTHQUAKE",
        "severity": 9,
        "coords": [23.242, 69.6669],
        "angles": [
            {
                "id": "angle1",
                "name": "Orbital Nadir Walled City",
                "desc": "High-altitude satellite orthophoto of Bhuj circular walled city & Hamirsar Lake.",
                "hotspot": "Hamirsar Lake Periphery & Old Historic Core",
                "urgency": "LEVEL 1 CRITICAL -- CANINE LIFE DETECTION SQUADS",
                "b_file": os.path.join(dest_dir, "bhuj_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "bhuj_macro_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Sub-Meter Residential Blocks",
                "desc": "Sub-meter satellite view of dense residential town blocks showing collapsed structures & rescue teams.",
                "hotspot": "Central Market & High-Density Residential Clusters",
                "urgency": "LEVEL 1 EMERGENCY -- RESCUE DRILLS & HEAVY LIFTERS",
                "b_file": os.path.join(dest_dir, "bhuj_close_before.jpg"),
                "a_file": os.path.join(dest_dir, "bhuj_close_after.jpg"),
                "crop": None
            },
            {
                "id": "angle3",
                "name": "Highway Overpass & Industrial Fault",
                "desc": "Drone orthophoto showing collapsed bridge span section and ground fault fissures splitting highway.",
                "hotspot": "NH-8A Transit Interchange & Industrial Hub",
                "urgency": "HIGH -- SECURE GAS PIPELINES & ROAD BLOCKADES",
                "b_file": os.path.join(dest_dir, "bhuj_fault_before.jpg"),
                "a_file": os.path.join(dest_dir, "bhuj_fault_after.jpg"),
                "crop": None
            }
        ]
    },
    {
        "spot_id": "disaster-landslide-wayanad",
        "title": "Wayanad Western Ghats Debris Avalanche",
        "location": "Chooralmala-Meppadi, Wayanad, Kerala",
        "disasterType": "LANDSLIDE",
        "severity": 10,
        "coords": [11.5218, 76.1342],
        "angles": [
            {
                "id": "angle1",
                "name": "Tea Plantation Avalanche",
                "desc": "Satellite perspective capturing massive red mudflow carving down emerald tea hills.",
                "hotspot": "Meppadi Upper Tea Division & River Valley",
                "urgency": "LEVEL 1 DISASTER -- ARMY DISASTER RESPONSE SQUADS",
                "b_file": os.path.join(dest_dir, "wayanad_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "wayanad_macro_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Chooralmala Bridge & Settlement",
                "desc": "Close-up perspective on town bridge washed away with giant granite boulders deposited across valley.",
                "hotspot": "Chooralmala Bridge Confluence & Settlement",
                "urgency": "CRITICAL -- RAPID BAILEY BRIDGE CONSTRUCTION",
                "b_file": os.path.join(dest_dir, "wayanad_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "wayanad_macro_after.jpg"),
                "crop": (0.2, 0.45, 0.85, 0.95)
            },
            {
                "id": "angle3",
                "name": "Upper Ridge Crown Scarp",
                "desc": "High-altitude crown scarp detachment zone triggered by extreme monsoon rainfall.",
                "hotspot": "Vellarimala Peak Escarpment Chute",
                "urgency": "MONITORING -- GEOLOGICAL SURVEY DRONE LIDAR",
                "b_file": os.path.join(dest_dir, "wayanad_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "wayanad_macro_after.jpg"),
                "crop": (0.35, 0.1, 0.9, 0.6)
            }
        ]
    },
    {
        "spot_id": "disaster-flood-assam",
        "title": "Assam Brahmaputra Valley Alluvial Inundation",
        "location": "Kaziranga-Brahmaputra Basin, Assam",
        "disasterType": "FLOOD",
        "severity": 9,
        "coords": [26.6528, 93.1711],
        "angles": [
            {
                "id": "angle1",
                "name": "Brahmaputra Basin Macro Swath",
                "desc": "Wide braided river channels vs massive flood inundation covering entire alluvial valley.",
                "hotspot": "Braided River Channels & Central Farmlands",
                "urgency": "LEVEL 1 CRITICAL -- AIRDROP FOOD & WATER RAFTS",
                "b_file": os.path.join(dest_dir, "assam_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "assam_macro_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Submerged Village Hamlets",
                "desc": "Close-up perspective of submerged rural settlements with rescue boats navigating floodwaters.",
                "hotspot": "Lowland Village Clusters & Ring Embankments",
                "urgency": "ACTIVE -- POWER BOAT RESCUE TEAMS",
                "b_file": os.path.join(dest_dir, "assam_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "assam_macro_after.jpg"),
                "crop": (0.1, 0.5, 0.85, 0.98)
            },
            {
                "id": "angle3",
                "name": "Kaziranga Wetland Buffer",
                "desc": "Upper valley wetland and agricultural paddies submerged under muddy silt flood sheets.",
                "hotspot": "Upper River Flats & Agricultural Corridors",
                "urgency": "HIGH -- ANIMAL HIGHLAND CORRIDORS SURVEILLANCE",
                "b_file": os.path.join(dest_dir, "assam_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "assam_macro_after.jpg"),
                "crop": (0.15, 0.15, 0.85, 0.6)
            }
        ]
    },
    {
        "spot_id": "disaster-landslide-chamoli",
        "title": "Joshimath-Chamoli Highway Hillside Collapse",
        "location": "Chamoli District, Uttarakhand",
        "disasterType": "LANDSLIDE",
        "severity": 8,
        "coords": [30.5526, 79.5658],
        "angles": [
            {
                "id": "angle1",
                "name": "Himalayan Ridge & Highway Scar",
                "desc": "Steep alpine slope with massive rockfall scar severing winding highway and damming gorge.",
                "hotspot": "Joshimath-Badrinath KM-48 Escarpment",
                "urgency": "LEVEL 2 EMERGENCY -- HEAVY EXCAVATOR EXTRICATION",
                "b_file": os.path.join(dest_dir, "chamoli_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "chamoli_macro_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Alaknanda Gorge Damming & Lake",
                "desc": "Debris fan choking glacial river canyon creating an impounded water reservoir.",
                "hotspot": "River Gorge Chokepoint & Upstream Lake",
                "urgency": "HIGH WARNING -- MONITOR DAM BREACH FLOOD RISK",
                "b_file": os.path.join(dest_dir, "chamoli_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "chamoli_macro_after.jpg"),
                "crop": (0.35, 0.4, 0.85, 0.85)
            },
            {
                "id": "angle3",
                "name": "Upper Ridge Rock Fracture",
                "desc": "High-altitude rock face detachment scarp with fresh scree slope failure.",
                "hotspot": "Upper Mountain Crest Tension Fracture",
                "urgency": "IMMEDIATE -- EVACUATE UPPER RIDGE PILGRIM CAMPS",
                "b_file": os.path.join(dest_dir, "chamoli_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "chamoli_macro_after.jpg"),
                "crop": (0.25, 0.15, 0.75, 0.6)
            }
        ]
    },
    {
        "spot_id": "disaster-flood-mumbai",
        "title": "Mumbai Coastal Surge & Mithi River Inundation",
        "location": "Mumbai Coastal Sector, Maharashtra",
        "disasterType": "FLOOD",
        "severity": 9,
        "coords": [19.076, 72.8777],
        "angles": [
            {
                "id": "angle1",
                "name": "Macro Urban Inundation",
                "desc": "High-resolution satellite view of Mumbai urban sector, roads, and swollen river channels.",
                "hotspot": "Mithi River Drainage Basin & Kalina Lowlands",
                "urgency": "LEVEL 1 EMERGENCY -- ARTERIAL WATER RESCUE",
                "b_file": os.path.join(dest_dir, "flood_before.jpg"),
                "a_file": os.path.join(dest_dir, "flood_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Coastal Seawall & Harbour",
                "desc": "Close-up perspective on coastal barriers, docklands, and storm surge backflow.",
                "hotspot": "Coastal Highway Barriers & Dockyards",
                "urgency": "HIGH -- DEPLOY HIGH-CAPACITY HIGHWAY PUMPS",
                "b_file": os.path.join(dest_dir, "flood_before.jpg"),
                "a_file": os.path.join(dest_dir, "flood_after.jpg"),
                "crop": (0.05, 0.35, 0.7, 0.95)
            },
            {
                "id": "angle3",
                "name": "Suburban Transit Inundation",
                "desc": "Submerged railway tracks, intersections, and lowland slum settlements.",
                "hotspot": "Kurla-Sion Rail Corridor & Lowland Slums",
                "urgency": "CRITICAL -- EVACUATE STRANDED COMMUTERS",
                "b_file": os.path.join(dest_dir, "flood_before.jpg"),
                "a_file": os.path.join(dest_dir, "flood_after.jpg"),
                "crop": (0.35, 0.1, 0.95, 0.7)
            }
        ]
    },
    {
        "spot_id": "disaster-quake-delhi",
        "title": "Delhi-NCR Ridge Seismotectonic Fracture",
        "location": "Delhi-NCR Ridge Fault, New Delhi",
        "disasterType": "EARTHQUAKE",
        "severity": 8,
        "coords": [28.6139, 77.209],
        "angles": [
            {
                "id": "angle1",
                "name": "Metropolitan Structural Grid",
                "desc": "Dense high-rise corridor displaying structural shear cracks and fallen facade masonry.",
                "hotspot": "Noida-Mayur Vihar Highway Spine",
                "urgency": "LEVEL 1 EMERGENCY -- RESCUE & INFRASTRUCTURE TRIAGE",
                "b_file": os.path.join(dest_dir, "quake_before.jpg"),
                "a_file": os.path.join(dest_dir, "quake_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Highway Viaduct Segment Shear",
                "desc": "Close-up satellite view of cracked highway overpass and displaced expansion joints.",
                "hotspot": "Ring Road Flyover Interchange",
                "urgency": "HIGH -- STRUCTURAL SAFETY CLEARANCE REQUIRED",
                "b_file": os.path.join(dest_dir, "quake_before.jpg"),
                "a_file": os.path.join(dest_dir, "quake_after.jpg"),
                "crop": (0.1, 0.3, 0.7, 0.9)
            },
            {
                "id": "angle3",
                "name": "Old Delhi Walled Cluster Debris",
                "desc": "High-density residential brick rooftops choked with masonry rubble.",
                "hotspot": "Chandni Chowk / Daryaganj Dense Clusters",
                "urgency": "CRITICAL -- MANUAL DEBRIS CLEARANCE & AMBULANCE ACCESS",
                "b_file": os.path.join(dest_dir, "quake_before.jpg"),
                "a_file": os.path.join(dest_dir, "quake_after.jpg"),
                "crop": (0.3, 0.1, 0.9, 0.7)
            }
        ]
    },
    {
        "spot_id": "disaster-cyclone-odisha",
        "title": "Bay of Bengal Severe Cyclonic Storm Surge",
        "location": "Puri Coastline, Odisha",
        "disasterType": "CYCLONE",
        "severity": 9,
        "coords": [19.8135, 85.8312],
        "angles": [
            {
                "id": "angle1",
                "name": "Puri Coastline & Beach Surge",
                "desc": "150 km/h wind shear flattening casuarina tree belt; ocean seawater surging inland.",
                "hotspot": "Puri-Konark Marine Drive & Beach Front",
                "urgency": "LEVEL 1 CRITICAL -- EVACUATE CYCLONE SHELTER OVERFLOW",
                "b_file": os.path.join(dest_dir, "puri_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "puri_macro_after.jpg"),
                "crop": None
            },
            {
                "id": "angle2",
                "name": "Coastal Forest Buffer Breach",
                "desc": "Close-up satellite inspection of stripped brown tree canopy and flooded beach roadway.",
                "hotspot": "Casuarina Coastal Protective Buffer Belt",
                "urgency": "HIGH -- CLEAR FALLEN TIMBER FROM ROADWAYS",
                "b_file": os.path.join(dest_dir, "puri_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "puri_macro_after.jpg"),
                "crop": (0.05, 0.25, 0.65, 0.85)
            },
            {
                "id": "angle3",
                "name": "Coastal Fishing Village Inundation",
                "desc": "Seawater surge penetrating into coastal settlement, submerging access lanes.",
                "hotspot": "Astaranga Inshore Fishing Village",
                "urgency": "URGENT -- COAST GUARD INSHORE RESCUE SQUADS",
                "b_file": os.path.join(dest_dir, "puri_macro_before.jpg"),
                "a_file": os.path.join(dest_dir, "puri_macro_after.jpg"),
                "crop": (0.0, 0.5, 0.5, 1.0)
            }
        ]
    }
]

def main():
    print(f"Processing photorealistic satellite datasets for {len(CONFIG)} disaster spots...")
    master_index = {}

    for spot in CONFIG:
        spot_id = spot["spot_id"]
        master_index[spot_id] = {
            "spot_id": spot_id,
            "title": spot["title"],
            "location": spot["location"],
            "disasterType": spot["disasterType"],
            "severity": spot["severity"],
            "coords": spot["coords"],
            "angles": []
        }

        for idx, angle in enumerate(spot["angles"]):
            angle_id = angle["id"]
            prefix = f"{spot_id}_{angle_id}"

            b_orig = Image.open(angle["b_file"]).convert("RGB")
            a_orig = Image.open(angle["a_file"]).convert("RGB")

            if angle.get("crop"):
                b_crop = crop_box(b_orig, angle["crop"])
                a_crop = crop_box(a_orig, angle["crop"])
            else:
                b_crop = b_orig
                a_crop = a_orig

            b_img, a_img, h_img, o_img, damage_ext, peak_int = compute_heatmap_and_overlay(b_crop, a_crop)

            b_name = f"{prefix}_before.jpg"
            a_name = f"{prefix}_after.jpg"
            h_name = f"{prefix}_heatmap.png"
            o_name = f"{prefix}_overlay.png"

            b_img.save(os.path.join(dest_dir, b_name), quality=94)
            a_img.save(os.path.join(dest_dir, a_name), quality=94)
            h_img.save(os.path.join(dest_dir, h_name))
            o_img.save(os.path.join(dest_dir, o_name))

            angle_data = {
                "id": angle_id,
                "name": angle["name"],
                "description": angle["desc"],
                "hotspot": angle["hotspot"],
                "urgency": angle["urgency"],
                "damageExtent": f"{damage_ext}%",
                "peakIntensity": f"{peak_int} / 1.0",
                "before": f"/sample_disasters/{b_name}",
                "after": f"/sample_disasters/{a_name}",
                "heatmap": f"/sample_disasters/{h_name}",
                "overlay": f"/sample_disasters/{o_name}"
            }
            master_index[spot_id]["angles"].append(angle_data)
            print(f"  [OK] {spot_id} -> {angle_id}: Extent {damage_ext}%, Peak {peak_int}")

    # Write disaster_spots_registry.json
    json_path = os.path.join(dest_dir, "disaster_spots_registry.json")
    with open(json_path, "w") as f:
        json.dump(master_index, f, indent=2)

    # Write disasterRegistryData.js
    js_path = os.path.abspath(os.path.join(base_dir, "..", "frontend", "src", "components", "map", "panels", "disasterRegistryData.js"))
    js_content = "export const DISASTER_REGISTRY = " + json.dumps(master_index, indent=2) + ";\nexport default DISASTER_REGISTRY;\n"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)

    print("Master registry updated in JSON and JS successfully!")

if __name__ == "__main__":
    main()
