def calculate_severity(score: int) -> str:
    if score >= 75:
        return "CRITICAL"

    if score >= 50:
        return "HIGH"

    if score >= 25:
        return "MODERATE"

    return "LOW"