package com.disaster.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationMetricsDto {
    private long totalEventsTracked;
    private long falsePositivesShielded;
    private long corroboratedActionable;
    private long activeEvaluating;
    private long socialMentionsInWindow;
    private long authoritativeFeedsInWindow;
    private double averageCorroborationTimeMinutes;
    private int slidingWindowMinutes;
    private double panicShieldAccuracyPercent;
}
