package org.example.apibridge.controller;

import org.example.apibridge.dto.request.CreateEventRequest;
import org.example.apibridge.dto.request.LoginRequest;
import org.example.apibridge.dto.request.VoteRequest;
import org.example.apibridge.dto.response.StandardResponse;
import org.example.shared.Candidate;
import org.example.shared.EventInfo;
import org.example.shared.VotingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.rmi.RemoteException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class VotingController {

    private final VotingService votingService;

    public VotingController(VotingService votingService) {
        this.votingService = votingService;
    }

    @PostMapping("/create")
    public ResponseEntity<StandardResponse<EventInfo>> createEvent(@RequestBody CreateEventRequest req) throws RemoteException {
        if (req == null || req.eventName() == null || req.eventName().isBlank()) {
            throw new IllegalArgumentException("eventName is required");
        }
        EventInfo info = votingService.createEvent(req.eventName());
        return ResponseEntity.ok(StandardResponse.ok(info));
    }

    @PostMapping("/{eventId}/candidates")
    public ResponseEntity<StandardResponse<Map<String,Object>>> addCandidate(
            @PathVariable String eventId,
            @RequestParam("name") String name,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException, RemoteException {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Candidate name required");
        }
        byte[] photoBytes = (photo != null && !photo.isEmpty()) ? photo.getBytes() : null;
        String candidateId = votingService.addCandidate(eventId, name, photoBytes);
        Map<String,Object> payload = new HashMap<>();
        payload.put("candidateId", candidateId);
        payload.put("eventId", eventId);
        payload.put("name", name);
        payload.put("hasPhoto", photoBytes != null);
        return ResponseEntity.ok(StandardResponse.ok(payload));
    }

    @PutMapping("/{eventId}/candidates/{candidateId}")
    public ResponseEntity<StandardResponse<Map<String,Object>>> updateCandidate(
            @PathVariable String eventId,
            @PathVariable String candidateId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException, RemoteException {
        byte[] photoBytes = (photo != null && !photo.isEmpty()) ? photo.getBytes() : null;
        boolean updated = votingService.updateCandidate(eventId, candidateId, name, photoBytes);
        if (!updated) {
            return ResponseEntity.status(404).body(StandardResponse.fail("NOT_FOUND","Candidate not found or nothing to update"));
        }
        Map<String,Object> payload = new HashMap<>();
        payload.put("candidateId", candidateId);
        payload.put("eventId", eventId);
        payload.put("updated", true);
        return ResponseEntity.ok(StandardResponse.ok(payload));
    }

    @DeleteMapping("/{eventId}/candidates/{candidateId}")
    public ResponseEntity<StandardResponse<Map<String,Object>>> deleteCandidate(
            @PathVariable String eventId,
            @PathVariable String candidateId) throws RemoteException {
        boolean deleted = votingService.deleteCandidate(eventId, candidateId);
        if (!deleted) {
            return ResponseEntity.status(404).body(StandardResponse.fail("NOT_FOUND","Candidate not found"));
        }
        Map<String,Object> payload = new HashMap<>();
        payload.put("candidateId", candidateId);
        payload.put("eventId", eventId);
        payload.put("deleted", true);
        return ResponseEntity.ok(StandardResponse.ok(payload));
    }

    @PostMapping("/{eventId}/vote")
    public ResponseEntity<StandardResponse<Map<String,Object>>> castVote(@PathVariable String eventId,
            @RequestBody VoteRequest vote) throws RemoteException {
        if (vote == null || vote.userId() == null || vote.candidateId() == null) {
            throw new IllegalArgumentException("userId and candidateId required");
        }
        boolean success = votingService.castVote(vote.userId(), eventId, vote.candidateId());
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("candidateId", vote.candidateId());
        data.put("userId", vote.userId());
        data.put("success", success);
        if (!success) {
            return ResponseEntity.status(409).body(StandardResponse.fail("ALREADY_VOTED","User has already voted"));
        }
        return ResponseEntity.ok(StandardResponse.ok(data));
    }

    @GetMapping("/{eventId}/results")
    public ResponseEntity<StandardResponse<Map<String,Object>>> getResults(@PathVariable String eventId) throws RemoteException {
        Map<String,Integer> results = votingService.getResults(eventId);
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("totalVotes", results.values().stream().mapToInt(Integer::intValue).sum());
        data.put("results", results);
        return ResponseEntity.ok(StandardResponse.ok(data));
    }

    @PostMapping("/{eventId}/accounts")
    public ResponseEntity<StandardResponse<Map<String,Object>>> createAccounts(@PathVariable String eventId,
            @RequestBody Map<String,Integer> payload) throws RemoteException {
        Integer size = payload != null ? payload.get("eventSize") : null;
        if (size == null || size < 1) {
            throw new IllegalArgumentException("eventSize must be positive");
        }
        List<Map<String,String>> accounts = votingService.createAccounts(eventId, size);
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("accountsCreated", accounts.size());
        data.put("accounts", accounts);
        return ResponseEntity.ok(StandardResponse.ok(data));
    }

    @GetMapping("/{eventId}/accounts")
    public ResponseEntity<StandardResponse<Map<String,Object>>> getUserAccounts(@PathVariable String eventId) throws RemoteException {
        List<Map<String,String>> accounts = votingService.getUserAccounts(eventId);
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("totalAccounts", accounts.size());
        data.put("accounts", accounts);
        return ResponseEntity.ok(StandardResponse.ok(data));
    }

    @PostMapping("/login")
    public ResponseEntity<StandardResponse<Map<String,String>>> login(@RequestBody LoginRequest req) throws RemoteException {
        if (req == null || req.username() == null || req.password() == null) {
            throw new IllegalArgumentException("username and password required");
        }
        Map<String,String> userInfo = votingService.Login(req.username(), req.password());
        if (userInfo == null) {
            return ResponseEntity.status(401).body(StandardResponse.fail("UNAUTHORIZED","Invalid credentials"));
        }
        return ResponseEntity.ok(StandardResponse.ok(userInfo));
    }

    @GetMapping("/{eventId}/vote-status/{userId}")
    public ResponseEntity<StandardResponse<Map<String,Object>>> voteStatus(@PathVariable String eventId,
            @PathVariable String userId) throws RemoteException {
        boolean hasVoted = votingService.hasUserVoted(userId, eventId);
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("userId", userId);
        data.put("hasVoted", hasVoted);
        return ResponseEntity.ok(StandardResponse.ok(data));
    }

    @GetMapping("/{eventId}/candidates")
    public ResponseEntity<StandardResponse<Map<String,Object>>> candidates(@PathVariable String eventId,
            @RequestParam String password) throws RemoteException {
        List<Candidate> list = votingService.getEventForVoter(eventId, password);
        if (list == null) {
            // For security we still use generic message but code can hint cause
            return ResponseEntity.status(404).body(StandardResponse.fail("EVENT_OR_PASSWORD_INVALID","Invalid event or password"));
        }
        // Convert photo bytes to base64 data URLs for frontend display
        List<Map<String,Object>> transformed = list.stream().map(c -> {
            Map<String,Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            if (c.getPhoto() != null && c.getPhoto().length > 0) {
                String b64 = java.util.Base64.getEncoder().encodeToString(c.getPhoto());
                m.put("photo", "data:image/jpeg;base64," + b64);
            }
            return m;
        }).toList();
        Map<String,Object> data = new HashMap<>();
        data.put("eventId", eventId);
        data.put("totalCandidates", transformed.size());
        data.put("candidates", transformed);
        return ResponseEntity.ok(StandardResponse.ok(data));
    }
}
