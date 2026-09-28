package com.disaster.verification.repository;

import com.disaster.verification.model.AuthoritativeFeedItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuthoritativeFeedRepository extends MongoRepository<AuthoritativeFeedItem, String> {
    List<AuthoritativeFeedItem> findTop50ByOrderByPublishedAtDesc();
    List<AuthoritativeFeedItem> findByVerificationEventIdOrderByPublishedAtDesc(String verificationEventId);
    List<AuthoritativeFeedItem> findByPublishedAtAfterOrderByPublishedAtDesc(Instant threshold);
}
