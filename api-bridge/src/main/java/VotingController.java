package org.example.apibridge;

import org.example.shared.VotingService;
import org.example.shared.EventInfo;
import org.example.shared.Candidate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.rmi.RemoteException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Import shared classes from the shared module
// These classes are defined in the shared module and used by both RMI server and API bridge

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class VotingController {

    // Spring injects the RMI client bean configured in RmiClientConfig
    @Autowired
    private VotingService votingService;

    // Notice there is NO LOGIC here. It just calls the RMI service.
    @PostMapping("/create")
    public EventInfo createEvent(@RequestBody Map<String, String> payload) throws RemoteException {
        return votingService.createEvent(payload.get("eventName"));
    }

    @PostMapping("/{eventId}/candidates")
    public ResponseEntity<Map<String, String>> addCandidate(
            @PathVariable String eventId,
            @RequestParam("name") String name,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        byte[] photoBytes = null;
        if (photo != null && !photo.isEmpty()) {
            photoBytes = photo.getBytes();
        }

        votingService.addCandidate(eventId, name, photoBytes);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Candidate '" + name + "' added successfully to event " + eventId);
        response.put("candidateName", name);
        response.put("eventId", eventId);
        response.put("hasPhoto", photoBytes != null ? "true" : "false");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/vote")
    public ResponseEntity<Map<String, Object>> castVote(@PathVariable String eventId,
            @RequestBody Map<String, String> payload)
            throws RemoteException {
        String userId = payload.get("userId");
        String candidateId = payload.get("candidateId");

        if (userId == null || candidateId == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Missing required fields: userId and candidateId");
            errorResponse.put("success", false);
            errorResponse.put("eventId", eventId);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        boolean success = votingService.castVote(userId, eventId, candidateId);

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("message", "Vote cast successfully");
            response.put("success", true);
        } else {
            response.put("message", "Vote failed - User may have already voted or invalid data");
            response.put("success", false);
        }
        response.put("eventId", eventId);
        response.put("candidateId", candidateId);
        response.put("userId", userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/results")
    public ResponseEntity<Map<String, Object>> getResults(@PathVariable String eventId) throws RemoteException {
        Map<String, Integer> results = votingService.getResults(eventId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Retrieved voting results for event " + eventId);
        response.put("eventId", eventId);
        response.put("totalVotes", results.values().stream().mapToInt(Integer::intValue).sum());
        response.put("results", results);

        return ResponseEntity.ok(response);
    }

    // Admin endpoints for user account management
    @PostMapping("/{eventId}/accounts")
    public ResponseEntity<Map<String, Object>> createAccounts(@PathVariable String eventId,
            @RequestBody Map<String, Integer> payload) throws RemoteException {
        int eventSize = payload.get("eventSize");
        List<Map<String, String>> createdAccounts = votingService.createAccounts(eventId, eventSize);

        Map<String, Object> response = new HashMap<>();
        response.put("message",
                "Successfully created " + createdAccounts.size() + " user accounts for event " + eventId);
        response.put("eventId", eventId);
        response.put("accountsCreated", createdAccounts.size());
        response.put("accounts", createdAccounts);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/accounts")
    public ResponseEntity<Map<String, Object>> getUserAccounts(@PathVariable String eventId) throws RemoteException {
        Map<Integer, String> userAccounts = votingService.getUserAccounts(eventId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Retrieved user accounts for event " + eventId);
        response.put("eventId", eventId);
        response.put("totalAccounts", userAccounts.size());
        response.put("accounts", userAccounts);

        return ResponseEntity.ok(response);
    }

    // Voter authentication and event access endpoints
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> payload) throws RemoteException {
        String username = payload.get("username");
        String password = payload.get("password");
        Map<String, String> response = new HashMap<>();
        try {
            Map<String, String> userInfo = votingService.Login(username, password);
            response.put("message", "Login successful");
            response.put("username", username);
            response.put("status", "authenticated");
            response.put("userId", userInfo.get("userId"));
            response.put("eventId", userInfo.get("eventId"));
            response.put("eventName", userInfo.get("eventName"));
            response.put("eventPassword", userInfo.get("eventPassword"));
            return ResponseEntity.ok(response);
        } catch (RemoteException e) {
            response.put("message", "Invalid credentials");
            response.put("status", "unauthorized");
            return ResponseEntity.status(401).body(response);
        }
    }

    @GetMapping("/{eventId}/vote-status/{userId}")
    public ResponseEntity<Map<String, Object>> checkVoteStatus(@PathVariable String eventId,
            @PathVariable String userId) throws RemoteException {
        boolean hasVoted = votingService.hasUserVoted(userId, eventId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vote status retrieved for user " + userId + " in event " + eventId);
        response.put("eventId", eventId);
        response.put("userId", userId);
        response.put("hasVoted", hasVoted);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{eventId}/candidates")
    public ResponseEntity<Map<String, Object>> getEventForVoter(@PathVariable String eventId,
            @RequestParam String password)
            throws RemoteException {
        List<Candidate> candidates = votingService.getEventForVoter(eventId, password);
        if (candidates == null) {
            throw new RemoteException("Invalid event ID or password");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Retrieved candidates for event " + eventId);
        response.put("eventId", eventId);
        response.put("totalCandidates", candidates.size());
        response.put("candidates", candidates);

        return ResponseEntity.ok(response);
    }
}