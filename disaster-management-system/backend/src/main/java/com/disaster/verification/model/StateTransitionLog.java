package com.disaster.verification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateTransitionLog {
    private VerificationStatus fromStatus;
    private VerificationStatus toStatus;
    private double scoreAtTransition;
    private Instant timestamp;
    private String triggerEvent;
    private String rationale;
}
