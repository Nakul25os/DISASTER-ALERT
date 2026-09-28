package com.disaster.verification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorroborationScoring {
    // Component weights
    private double socialVelocityScore;       // max 25 pts (mentions/min spike velocity vs baseline)
    private double socialCredibilityScore;    // max 15 pts (verified accounts + citizen reputation)
    private double authoritativeTrustScore;   // max 35 pts (IMD/NDMA/CWC official bulletin confirmation)
    private double geoProximityScore;         // max 15 pts (spatial distance between social cluster & official coordinates)
    private double temporalAlignmentScore;     // max 10 pts (temporal proximity within sliding window)
    
    // Aggregates & Policy Flags
    private double totalScore;                // 0.0 to 100.0
    private double thresholdRequired;         // e.g. 70.0 for ACTIONABLE escalation
    private double socialOnlyCap;             // e.g. 38.0 max when authoritativeCount == 0 (Strict Panic Shield)
    private boolean authoritativeCorroborated;// true if >= 1 verified official source matches
    private boolean thresholdMet;             // true if totalScore >= thresholdRequired && authoritativeCorroborated
    private String scoringRationale;
}
