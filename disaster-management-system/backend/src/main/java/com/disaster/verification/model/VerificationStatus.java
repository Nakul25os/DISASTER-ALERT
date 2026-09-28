package com.disaster.verification.model;

/**
 * State lifecycle of an event detected within the verification engine:
 * 
 * 1. UNVERIFIED: Initial anomalous spike or rumor detected. Suppressed/quarantined from full system dispatch.
 * 2. CORROBORATING: Partial signals or active official bulletin matching in sliding window.
 * 3. ACTIONABLE: Strict cross-source corroboration met (social spike + official RSS/met stream). Dispatched to alerts/shelters/responders.
 * 4. DISMISSED: Sliding window expired without authoritative proof or proven false rumor.
 */
public enum VerificationStatus {
    UNVERIFIED,
    CORROBORATING,
    ACTIONABLE,
    DISMISSED
}
