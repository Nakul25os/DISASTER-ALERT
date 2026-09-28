"""
Indian States and Union Territories Geocoding Coordinates Mapper.
Maps all 28 states and 8 union territories to representative centroid coordinates.
"""

INDIA_CENTER = {
    "latitude": 20.5937,
    "longitude": 78.9629,
    "state": "Pan India"
}

STATE_COORDINATES = {
    # 28 States
    "Andhra Pradesh": {"latitude": 15.9129, "longitude": 79.7400},
    "Arunachal Pradesh": {"latitude": 28.2180, "longitude": 94.7278},
    "Assam": {"latitude": 26.2006, "longitude": 92.9376},
    "Bihar": {"latitude": 25.0961, "longitude": 85.3131},
    "Chhattisgarh": {"latitude": 21.2787, "longitude": 81.8661},
    "Goa": {"latitude": 15.2993, "longitude": 74.1240},
    "Gujarat": {"latitude": 22.2587, "longitude": 71.1924},
    "Haryana": {"latitude": 29.0588, "longitude": 76.0856},
    "Himachal Pradesh": {"latitude": 31.1048, "longitude": 77.1734},
    "Jharkhand": {"latitude": 23.6102, "longitude": 85.2799},
    "Karnataka": {"latitude": 15.3173, "longitude": 75.7139},
    "Kerala": {"latitude": 10.8505, "longitude": 76.2711},
    "Madhya Pradesh": {"latitude": 22.9734, "longitude": 78.6569},
    "Maharashtra": {"latitude": 19.7515, "longitude": 75.7139},
    "Manipur": {"latitude": 24.6637, "longitude": 93.9063},
    "Meghalaya": {"latitude": 25.4670, "longitude": 91.3662},
    "Mizoram": {"latitude": 23.1645, "longitude": 92.9376},
    "Nagaland": {"latitude": 26.1584, "longitude": 94.5624},
    "Odisha": {"latitude": 20.9517, "longitude": 85.0985},
    "Punjab": {"latitude": 31.1471, "longitude": 75.3412},
    "Rajasthan": {"latitude": 27.0238, "longitude": 74.2179},
    "Sikkim": {"latitude": 27.5330, "longitude": 88.5122},
    "Tamil Nadu": {"latitude": 11.1271, "longitude": 78.6569},
    "Telangana": {"latitude": 18.1124, "longitude": 79.0193},
    "Tripura": {"latitude": 23.9408, "longitude": 91.9882},
    "Uttar Pradesh": {"latitude": 26.8467, "longitude": 80.9462},
    "Uttarakhand": {"latitude": 30.0668, "longitude": 79.0193},
    "West Bengal": {"latitude": 22.9868, "longitude": 87.8550},

    # 8 Union Territories
    "Andaman and Nicobar Islands": {"latitude": 11.7401, "longitude": 92.6586},
    "Chandigarh": {"latitude": 30.7333, "longitude": 76.7794},
    "Dadra and Nagar Haveli and Daman and Diu": {"latitude": 20.1809, "longitude": 73.0169},
    "Delhi": {"latitude": 28.7041, "longitude": 77.1025},
    "Jammu and Kashmir": {"latitude": 33.7782, "longitude": 76.5762},
    "Ladakh": {"latitude": 34.1526, "longitude": 77.5771},
    "Lakshadweep": {"latitude": 10.5667, "longitude": 72.6417},
    "Puducherry": {"latitude": 11.9416, "longitude": 79.8083},
}

# Major cities/districts mapped to states for higher precision
CITY_TO_STATE = {
    "jaipur": "Rajasthan", "jodhpur": "Rajasthan", "bikaner": "Rajasthan", "ganganagar": "Rajasthan", "hanumangarh": "Rajasthan",
    "mumbai": "Maharashtra", "pune": "Maharashtra", "nagpur": "Maharashtra",
    "delhi": "Delhi", "new delhi": "Delhi",
    "bengaluru": "Karnataka", "bangalore": "Karnataka",
    "chennai": "Tamil Nadu", "coimbatore": "Tamil Nadu",
    "hyderabad": "Telangana",
    "kolkata": "West Bengal", "siliguri": "West Bengal",
    "patna": "Bihar", "gaya": "Bihar",
    "lucknow": "Uttar Pradesh", "varanasi": "Uttar Pradesh", "noida": "Uttar Pradesh",
    "guwahati": "Assam", "kaziranga": "Assam",
    "shimla": "Himachal Pradesh", "manali": "Himachal Pradesh",
    "dehradun": "Uttarakhand", "chamoli": "Uttarakhand",
    "bhopal": "Madhya Pradesh", "indore": "Madhya Pradesh",
    "ahmedabad": "Gujarat", "surat": "Gujarat", "kutch": "Gujarat",
    "bhubaneswar": "Odisha", "puri": "Odisha",
    "thiruvananthapuram": "Kerala", "kochi": "Kerala", "wayanad": "Kerala",
    "amritsar": "Punjab", "ludhiana": "Punjab",
    "srinagar": "Jammu and Kashmir", "jammu": "Jammu and Kashmir",
    "leh": "Ladakh"
}


def extract_state(text: str) -> str | None:
    """
    Search text for 28 Indian states, 8 UTs, and major cities.
    """
    if not text:
        return None
    
    text_lower = text.lower()

    # 1. Direct state / UT match
    for state_name in STATE_COORDINATES:
        if state_name.lower() in text_lower:
            return state_name

    # 2. Known city / district match
    for city, state in CITY_TO_STATE.items():
        if city in text_lower:
            return state

    return None


def get_coordinates_for_state(state_name: str | None) -> dict:
    """
    Returns latitude and longitude for a given state, falling back to India center.
    """
    if state_name and state_name in STATE_COORDINATES:
        return {
            "latitude": STATE_COORDINATES[state_name]["latitude"],
            "longitude": STATE_COORDINATES[state_name]["longitude"],
            "state": state_name
        }
    
    return INDIA_CENTER.copy()
