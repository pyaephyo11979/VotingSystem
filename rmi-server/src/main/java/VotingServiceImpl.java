import org.example.shared.VotingService;
import org.example.shared.EventInfo;
import org.example.shared.Candidate;
import org.example.shared.User;
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class VotingServiceImpl extends UnicastRemoteObject implements VotingService {
    private final Map<String, List<Candidate>> events = new ConcurrentHashMap<>();
    private final Map<String, String> eventPasswords = new ConcurrentHashMap<>();
    private final DBController dbController;

    public VotingServiceImpl() throws RemoteException {
        super();
        this.dbController = new DBController();
    }

    @Override
    public EventInfo createEvent(String eventName) throws RemoteException {
        String eventId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String password = UUID.randomUUID().toString().substring(0, 6);

        // Store in database
        boolean created = dbController.createEvent(eventName, eventId, password);
        if (created) {
            events.put(eventId, new ArrayList<>());
            eventPasswords.put(eventId, password);
            System.out.println("✅ RMI: Event Created: " + eventName + " | ID: " + eventId);
            return new EventInfo(eventId, eventName, password);
        } else {
            System.err.println("❌ RMI: Failed to create event in database: " + eventName);
            throw new RemoteException("Failed to create event in database");
        }
    }

    @Override
    public void addCandidate(String eventId, String candidateName, byte[] photo) throws RemoteException {
        if (!events.containsKey(eventId)) {
            System.err.println("❌ RMI: Attempted to add candidate to non-existent event: " + eventId);
            return;
        }

        // Store in database
        boolean added = dbController.addCandidate(eventId, candidateName, photo);
        if (added) {
            Candidate newCandidate = new Candidate(UUID.randomUUID().toString(), candidateName, photo);
            events.get(eventId).add(newCandidate);
            System.out.println("✅ RMI: Candidate '" + candidateName + "' added to event " + eventId);
        } else {
            System.err.println("❌ RMI: Failed to add candidate to database: " + candidateName);
            throw new RemoteException("Failed to add candidate to database");
        }
    }

    @Override
    public boolean castVote(String userId, String eventId, String candidateId) throws RemoteException {
        try {
            // Cast vote in database with user validation
            boolean success = dbController.castVote(userId, eventId, candidateId);
            if (success) {
                System.out.println("🗳️ RMI: Vote cast successfully - User: " + userId + ", Candidate: " + candidateId
                        + ", Event: " + eventId);
            } else {
                System.out.println("❌ RMI: Vote failed - User may have already voted or invalid data");
            }
            return success;
        } catch (Exception e) {
            System.err.println("❌ RMI: Failed to cast vote - User: " + userId + ", Event: " + eventId + ", Candidate: "
                    + candidateId);
            throw new RemoteException("Failed to cast vote", e);
        }
    }

    @Override
    public boolean hasUserVoted(String userId, String eventId) throws RemoteException {
        try {
            boolean hasVoted = dbController.hasUserVoted(userId, eventId);
            System.out.println("🔍 RMI: Checking vote status - User: " + userId + ", Event: " + eventId
                    + ", Has voted: " + hasVoted);
            return hasVoted;
        } catch (Exception e) {
            System.err.println("❌ RMI: Failed to check vote status - User: " + userId + ", Event: " + eventId);
            throw new RemoteException("Failed to check vote status", e);
        }
    }

    @Override
    public List<Candidate> getEventForVoter(String eventId, String password) throws RemoteException {
        String storedPassword = eventPasswords.get(eventId);
        if (storedPassword != null && storedPassword.equals(password)) {
            // Get candidates from database
            List<Map<String, String>> candidateData = dbController.getCandidates(eventId);
            List<Candidate> candidates = new ArrayList<>();
            for (Map<String, String> data : candidateData) {
                candidates.add(new Candidate(data.get("id"), data.get("name"), null)); // Photo not retrieved for voting
            }
            return candidates;
        }
        return null;
    }

    @Override
    public Map<String, Integer> getResults(String eventId) throws RemoteException {
        // Get results from database
        List<Map<String, String>> candidateData = dbController.getCandidates(eventId);
        Map<String, Integer> results = new HashMap<>();
        for (Map<String, String> data : candidateData) {
            results.put(data.get("name"), Integer.parseInt(data.get("votes")));
        }
        return results;
    }

    @Override
    public Map<String, String> Login(String username, String password) throws RemoteException {
        Map<String, String> userInfo = dbController.getUserInfo(username, password);
        if (userInfo == null) {
            throw new RemoteException("Invalid username or password");
        }
        System.out.println("✅ RMI: User logged in: " + username + " for event: " + userInfo.get("eventId"));
        return userInfo;
    }

    @Override
    public List<Map<String, String>> createAccounts(String eventId, int eventSize) throws RemoteException {
        List<Map<String, String>> createdAccounts = new ArrayList<>();
        for (int i = 0; i < eventSize; i++) {
            String id = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String psw = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String username = UUID.randomUUID().toString().substring(0, 8);

            // Register user in database
            boolean registered = dbController.registerUser(id, psw, username, eventId);
            if (registered) {
                Map<String, String> accountInfo = new HashMap<>();
                accountInfo.put("username", username);
                accountInfo.put("userId", id);
                accountInfo.put("password", psw);
                accountInfo.put("eventId", eventId);
                createdAccounts.add(accountInfo);
                System.out.println(
                        "✅ RMI: User account created: id: " + id + " username: " + username + " password: " + psw);
            } else {
                System.err.println("❌ RMI: Failed to create user account: " + id);
            }
        }
        System.out.println("✅ RMI: Created " + createdAccounts.size() + " user accounts for event " + eventId);
        return createdAccounts;
    }

    @Override
    public Map<Integer, String> getUserAccounts(String eventId) throws RemoteException {
        Map<String, String> userAccounts = dbController.getUserAccounts(eventId);
        Map<Integer, String> indexedAccounts = new HashMap<>();
        int index = 0;
        for (Map.Entry<String, String> entry : userAccounts.entrySet()) {
            indexedAccounts.put(index++, "ID: " + entry.getKey() + " | Password: " + entry.getValue());
        }
        return indexedAccounts;
    }
}