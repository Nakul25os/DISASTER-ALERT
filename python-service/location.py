KNOWN_LOCATIONS = [
    "Rajendra Nagar",
    "Kankarbagh",
    "Vijay Nagar",
    "Railway Station",
    "hill area"
]


def extract_location(text: str) -> str | None:
    text_lower = text.lower()

    for location in KNOWN_LOCATIONS:
        if location.lower() in text_lower:
            return location

    return None