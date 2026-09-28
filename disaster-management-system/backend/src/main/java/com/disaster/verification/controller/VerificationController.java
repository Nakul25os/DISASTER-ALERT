package com.disaster.verification.controller;

import com.disaster.verification.dto.IngestAuthoritativeFeedRequest;
import com.disaster.verification.dto.IngestSocialMentionRequest;
import com.disaster.verification.dto.VerificationMetricsDto;
import com.disaster.verification.model.AuthoritativeFeedItem;
import com.disaster.verification.model.SocialMention;
import com.disaster.verification.model.VerificationEvent;
import com.disaster.verification.service.VerificationPipelineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationController {

    private final VerificationPipelineService pipelineService;

    public VerificationController(VerificationPipelineService pipelineService) {
        this.pipelineService = pipelineService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<VerificationEvent>> getEvents() {
        return ResponseEntity.ok(pipelineService.getAllEvents());
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<VerificationEvent> getEventById(@PathVariable String id) {
        return pipelineService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/metrics")
    public ResponseEntity<VerificationMetricsDto> getMetrics() {
        return ResponseEntity.ok(pipelineService.getMetrics());
    }

    @GetMapping("/stream/social")
    public ResponseEntity<List<SocialMention>> getSocialStream() {
        return ResponseEntity.ok(pipelineService.getRecentSocialStream());
    }

    @GetMapping("/stream/authoritative")
    public ResponseEntity<List<AuthoritativeFeedItem>> getAuthoritativeStream() {
        return ResponseEntity.ok(pipelineService.getRecentAuthoritativeStream());
    }

    @PostMapping("/ingest/social")
    public ResponseEntity<SocialMention> ingestSocial(@RequestBody IngestSocialMentionRequest request) {
        return ResponseEntity.ok(pipelineService.ingestSocialMention(request));
    }

    @PostMapping("/ingest/authoritative")
    public ResponseEntity<AuthoritativeFeedItem> ingestAuthoritative(@RequestBody IngestAuthoritativeFeedRequest request) {
        return ResponseEntity.ok(pipelineService.ingestAuthoritativeFeed(request));
    }

    @PostMapping("/simulate/false-rumor")
    public ResponseEntity<VerificationEvent> simulateFalseRumor() {
        return ResponseEntity.ok(pipelineService.simulateViralFalseRumor());
    }

    @PostMapping("/simulate/flash-flood")
    public ResponseEntity<VerificationEvent> simulateFlashFlood() {
        return ResponseEntity.ok(pipelineService.simulateFlashFloodCorroboration());
    }

    @PostMapping("/simulate/cyclone")
    public ResponseEntity<VerificationEvent> simulateCyclone() {
        return ResponseEntity.ok(pipelineService.simulateCycloneCorroboration());
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> reset() {
        pipelineService.resetPipeline();
        return ResponseEntity.ok(Map.of("message", "Verification pipeline reset successfully", "status", "RESET_OK"));
    }
}
