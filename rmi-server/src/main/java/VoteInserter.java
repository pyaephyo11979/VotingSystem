import java.sql.*;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.lang.String.*;

public class VoteInserter {
    private final String url = "jdbc:mysql://localhost:3306/votingdb";
    private final String username = "root";
    private final String password = "root";
    private Connection conn = null;

    public Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(url, username, password);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return conn;
    }

    public void closeConnection() {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public List<Map<String,String>> getCandidates(String eventId) {
        List<Map<String,String>> candidates = new ArrayList<>();
        String query = "SELECT c.id, c.name, c.photo, COUNT(v.candidate_id) as votes " +
                "FROM candidates c " +
                "LEFT JOIN votes v ON c.id = v.candidate_id AND v.event_id = ? " +
                "WHERE c.event_id = ? " +
                "GROUP BY c.id, c.name, c.photo";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            stmt.setString(2, eventId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, String> candidate = new HashMap<>();
                candidate.put("id", rs.getString("id"));
                candidate.put("name", rs.getString("name"));
                candidate.put("votes", rs.getString("votes"));
                try {
                    byte[] bytes = rs.getBytes("photo");
                    if (bytes != null && bytes.length > 0) {
                        candidate.put("photoBase64", Base64.getEncoder().encodeToString(bytes));
                    }
                } catch (Exception ignored) {}
                candidates.add(candidate);
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getCandidates: " + e.getMessage());
            e.printStackTrace();
        }
        return candidates;
    }
    public List<Map<String, String>> getUserAccounts(String eventId) {
        List<Map<String, String>> accounts = new ArrayList<>();
        String query = "SELECT id, username, password, event_id FROM users WHERE event_id = ?";
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            try (ResultSet rs = stmt.executeQuery()) {
                int count = 0;
                while (rs.next()) {
                    Map<String, String> userMap = new HashMap<>(); // NEW MAP EACH ROW
                    userMap.put("userId", rs.getString("id"));
                    userMap.put("username", rs.getString("username"));
                    userMap.put("password", rs.getString("password"));
                    userMap.put("eventId", rs.getString("event_id"));
                    accounts.add(userMap);
                    count++;
                }
                System.out.println("✅ Database: fetched " + count + " user account(s) for event " + eventId);
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getUserAccounts: " + e.getMessage());
            e.printStackTrace();
        }
        return accounts;
    }

    public boolean insertVote(String userId, String candidateId, String eventId) {
        // First check if user has already voted in this event
        String checkQuery = "SELECT COUNT(*) FROM votes WHERE user_id = ? AND event_id = ?";
        try (Connection conn = getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkQuery)) {

            checkStmt.setString(1, userId);
            checkStmt.setString(2, eventId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next() && rs.getInt(1) > 0) {
                System.out.println("❌ User " + userId + " has already voted in event " + eventId);
                return false; // User has already voted
            }

            // Cast the vote by inserting into votes table
            String voteQuery = "INSERT INTO votes (user_id, candidate_id, event_id) VALUES (?, ?, ?)";
            try (PreparedStatement voteStmt = conn.prepareStatement(voteQuery)) {
                voteStmt.setString(1, userId);
                voteStmt.setInt(2, Integer.parseInt(candidateId));
                voteStmt.setString(3, eventId);

                int rowsAffected = voteStmt.executeUpdate();
                if (rowsAffected > 0) {
                    System.out.println("✅ Vote cast successfully - User: " + userId + ", Candidate: " + candidateId
                            + ", Event: " + eventId);
                    return true;
                } else {
                    System.out.println("❌ Failed to cast vote");
                    return false;
                }
            }

        } catch (SQLException e) {
            System.err.println("❌ Database error in castVote: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            closeConnection();
        }
    }
    public List<Map<String,String>> getNotVotedUsers(){
        String getVotedUsersQuery = "SELECT DISTINCT user_id FROM votes";
        List<Map<String,String>> notVotedUsers = new ArrayList<>();
        try (Connection conn = getConnection();
             PreparedStatement stmt = conn.prepareStatement(getVotedUsersQuery)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                Map<String, String> userMap = new HashMap<>();
                userMap.put("userId", rs.getString("user_id"));
                notVotedUsers.add(userMap);
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getNotVotedUsers: " + e.getMessage());
            e.printStackTrace();
        }
        return notVotedUsers;
    }
    public static void main(String[] args) {
        VoteInserter inserter = new VoteInserter();
        List<Map<String,String>> candidates=inserter.getCandidates("DF39258D");
        List<Map<String,String>> users=inserter.getUserAccounts("DF39258D");
//        for(int i=0; i<=60; i++){
//            inserter.insertVote(users.get(i).get("userId"), candidates.get(0).get("id"), "DF39258D");
//        }
//        for (int i=0; i<=50; i++) {
//            int startIndex = 60 + i;
//            inserter.insertVote(users.get(startIndex).get("userId"), candidates.get(1).get("id"), "DF39258D");
//        }
//        for (int i=0; i<=100; i++) {
//            int startIndex = 110 + i;
//            inserter.insertVote(users.get(startIndex).get("userId"), candidates.get(2).get("id"), "DF39258D");
//        }
//        for (int i=0; i<=130; i++) {
//            int startIndex = 210 + i;
//            inserter.insertVote(users.get(startIndex).get("userId"), candidates.get(3).get("id"), "DF39258D");
//        }
        List<Map<String,String>> notVotedUsers=inserter.getNotVotedUsers();
        System.out.println(notVotedUsers);

    }

}
