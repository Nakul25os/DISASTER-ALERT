package com.disaster.verification.repository;

import com.disaster.verification.model.SocialMention;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SocialMentionRepository extends MongoRepository<SocialMention, String> {
    List<SocialMention> findTop50ByOrderByTimestampDesc();
    List<SocialMention> findByVerificationEventIdOrderByTimestampDesc(String verificationEventId);
    List<SocialMention> findByTimestampAfterOrderByTimestampDesc(Instant threshold);
}
