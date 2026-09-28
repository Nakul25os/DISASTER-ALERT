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
@Document(collection = "social_mentions")
public class SocialMention {
    @Id
    private String id;
    private SocialMediaPlatform platform;
    private String authorHandle;
    private String authorName;
    private boolean authorVerified;
    private double authorCredibility; // 0.0 to 1.0
    private String content;
    private DisasterType disasterType;
    private String locationName;
    private double latitude;
    private double longitude;
    private Instant timestamp;
    private double urgencyScore; // 1.0 to 5.0
    private int engagement; // retweets, shares, upvotes
    @Builder.Default
    private List<String> hashtags = new ArrayList<>();
    private String verificationEventId;
}
