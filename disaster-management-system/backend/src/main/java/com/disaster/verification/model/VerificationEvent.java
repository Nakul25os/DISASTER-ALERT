package com.disaster.verification.model;

import com.disaster.model.DisasterType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "verification_events")
public class VerificationEvent {
    @Id
    private String id;
    private String eventTitle;
    private DisasterType disasterType;
    private String locationName;
    private double latitude;
    private double longitude;
    private double affectedRadiusKm;
    
    @Builder.Default
    private VerificationStatus status = VerificationStatus.UNVERIFIED;
    
    private Instant firstDetectedAt;
    private Instant lastUpdatedAt;
    private Instant escalatedAt;
    
    @Builder.Default
    private int slidingWindowMinutes = 15;
    
    private CorroborationScoring scoring;
    
    @Builder.Default
    private int socialMentionCount = 0;
    
    @Builder.Default
    private double socialVelocityPerMinute = 0.0;
    
    @Builder.Default
    private int authoritativeCount = 0;
    
    @Builder.Default
    private List<SocialMention> recentSocialMentions = new ArrayList<>();
    
    @Builder.Default
    private List<AuthoritativeFeedItem> corroboratingFeeds = new ArrayList<>();
    
    @Builder.Default
    private List<StateTransitionLog> stateTransitions = new ArrayList<>();
    
    private String escalatedDisasterEventId;
    private String dismissalReason;
    
    @Builder.Default
    private boolean active = true;
}
