package com.disaster.verification.dto;

import com.disaster.model.DisasterType;
import com.disaster.verification.model.SocialMediaPlatform;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestSocialMentionRequest {
    private SocialMediaPlatform platform;
    private String authorHandle;
    private String authorName;
    private boolean authorVerified;
    private double authorCredibility;
    private String content;
    private DisasterType disasterType;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private Double urgencyScore;
    private Integer engagement;
    private List<String> hashtags;
}
