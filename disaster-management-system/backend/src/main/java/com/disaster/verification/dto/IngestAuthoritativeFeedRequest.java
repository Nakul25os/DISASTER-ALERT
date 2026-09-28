package com.disaster.verification.dto;

import com.disaster.model.DisasterType;
import com.disaster.verification.model.AuthoritativeSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestAuthoritativeFeedRequest {
    private AuthoritativeSourceType sourceType;
    private String agencyName;
    private String headline;
    private String bulletin;
    private DisasterType disasterType;
    private String severityLevel;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private Double affectedRadiusKm;
    private String bulletinUrl;
}
