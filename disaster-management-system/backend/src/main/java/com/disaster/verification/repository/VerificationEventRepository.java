package com.disaster.verification.repository;

import com.disaster.verification.model.VerificationEvent;
import com.disaster.verification.model.VerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationEventRepository extends MongoRepository<VerificationEvent, String> {
    List<VerificationEvent> findByActiveTrueOrderByLastUpdatedAtDesc();
    List<VerificationEvent> findByStatus(VerificationStatus status);
}
