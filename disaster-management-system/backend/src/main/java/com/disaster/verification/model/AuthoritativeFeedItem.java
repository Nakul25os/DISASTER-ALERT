package com.disaster.verification.model;

import com.disaster.model.DisasterType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "authoritative_feeds")
public class AuthoritativeFeedItem {
    @Id
    private String id;
    private AuthoritativeSourceType sourceType;
    private String agencyName;
    private String headline;
    private String bulletin;
    private DisasterType disasterType;
    private String severityLevel; // ADVISORY, WATCH, WARNING, SEVERE_ALERT
    private String locationName;
    private double latitude;
    private double longitude;
    private double affectedRadiusKm;
    private Instant publishedAt;
    private String bulletinUrl;
    @Builder.Default
    private boolean verifiedAgency = true;
    @Builder.Default
    private double officialTrustWeight = 0.95;
    private String verificationEventId;
}
