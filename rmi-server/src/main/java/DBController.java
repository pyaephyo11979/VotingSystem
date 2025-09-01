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

public class DBController {
    private final String url = "jdbc:mysql://localhost:3306/votingdb";
    private final String username = "root";
    private final String password = "root";
    private Connection conn = null;
    private static final String transformation = "AES/CBC/PKCS5Padding";
    private static final String SECRET = "your-32-char-secret-key-123456789012"; // 32 chars for AES-256

    private SecretKeySpec getSecretKey() throws Exception {
        byte[] key = SECRET.getBytes(StandardCharsets.UTF_8);
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        key = sha.digest(key);
        return new SecretKeySpec(key, "AES");
    }

    public String encryptPassword(String password) throws Exception {
        Cipher cipher = Cipher.getInstance(transformation);
        SecretKeySpec secretKey = getSecretKey();
        byte[] iv = new byte[16];
        new SecureRandom().nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
        byte[] encrypted = cipher.doFinal(password.getBytes(StandardCharsets.UTF_8));
        byte[] encryptedIvAndText = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, encryptedIvAndText, 0, iv.length);
        System.arraycopy(encrypted, 0, encryptedIvAndText, iv.length, encrypted.length);
        return Base64.getEncoder().encodeToString(encryptedIvAndText);
    }

    public String decryptPassword(String encrypted) throws Exception {
        byte[] encryptedIvTextBytes = Base64.getDecoder().decode(encrypted);
        byte[] iv = new byte[16];
        System.arraycopy(encryptedIvTextBytes, 0, iv, 0, 16);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);
        int encryptedSize = encryptedIvTextBytes.length - 16;
        byte[] encryptedBytes = new byte[encryptedSize];
        System.arraycopy(encryptedIvTextBytes, 16, encryptedBytes, 0, encryptedSize);
        Cipher cipher = Cipher.getInstance(transformation);
        SecretKeySpec secretKey = getSecretKey();
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
        byte[] decrypted = cipher.doFinal(encryptedBytes);
        return new String(decrypted, StandardCharsets.UTF_8);
    }

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

    public boolean validateUser(String userId, String password) {
        // Can't compare encrypted values because a new random IV is used each encryption.
        String query = "SELECT password FROM users WHERE id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String encPassword = rs.getString("password");
                    String decrypted = decryptPassword(encPassword);
                    return decrypted.equals(password);
                }
                return false;
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in validateUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public Map<String, String> getUserInfo(String username, String password) {
        // Fetch stored encrypted password then decrypt for comparison.
        String query = "SELECT u.id, u.event_id, u.password as enc_password, e.name as event_name, e.password as event_password " +
                "FROM users u JOIN events e ON u.event_id = e.id WHERE u.username = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String encPassword = rs.getString("enc_password");
                    String decrypted = decryptPassword(encPassword);
                    if (!decrypted.equals(password)) {
                        return null; // password mismatch
                    }
                    Map<String, String> userInfo = new HashMap<>();
                    userInfo.put("userId", rs.getString("id"));
                    userInfo.put("eventId", rs.getString("event_id"));
                    userInfo.put("eventName", rs.getString("event_name"));
                    userInfo.put("eventPassword", rs.getString("event_password"));
                    return userInfo;
                }
                return null;
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getUserInfo: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean registerUser(String userId, String password, String username, String eventID) {
        String query = "INSERT INTO users (id,username, password, event_id) VALUES (?, ?,?, ?)";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, userId);
            stmt.setString(2, username);
            stmt.setString(3, encryptPassword(password));
            stmt.setString(4, eventID);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            System.err.println("❌ Database error in registerUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean createEvent(String eventName, String eventId, String password) {
        String query = "INSERT INTO events (id, name, password) VALUES (?, ?, ?)";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            stmt.setString(2, eventName);
            stmt.setString(3, password);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("❌ Database error in createEvent: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean addCandidate(String eventId, String candidateName, byte[] photo) {
        // Expect table 'candidates.photo' to be a (LONG)BLOB to store raw bytes.
        String query = "INSERT INTO candidates (event_id, name, photo) VALUES (?, ?, ?)";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            stmt.setString(2, candidateName);
            stmt.setBytes(3, photo);
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("❌ Database error in addCandidate: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public Map<String, String> getUserAccounts(String eventId) {
        Map<String, String> userAccounts = new HashMap<>();
        String query = "SELECT username,password FROM users WHERE event_id = ?";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                String psw = decryptPassword(rs.getString("password"));
                userAccounts.put(rs.getString("username"), psw);
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getUserAccounts: " + e.getMessage());
            e.printStackTrace();
        }
        return userAccounts;
    }

    public List<Map<String, String>> getCandidates(String eventId) {
        List<Map<String, String>> candidates = new ArrayList<>();
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

    public String getEventPassword(String eventId) {
        String query = "SELECT password FROM events WHERE id = ?";
        try (Connection conn = getConnection(); PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, eventId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("password");
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Database error in getEventPassword: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean castVote(String userId, String eventId, String candidateId) {
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

    public boolean hasUserVoted(String userId, String eventId) {
        String query = "SELECT COUNT(*) FROM votes WHERE user_id = ? AND event_id = ?";
        try (Connection conn = getConnection();
                PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, userId);
            stmt.setString(2, eventId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                boolean hasVoted = rs.getInt(1) > 0;
                System.out
                        .println("🔍 Database: User " + userId + " vote status in event " + eventId + ": " + hasVoted);
                return hasVoted;
            }
            return false;
        } catch (SQLException e) {
            System.err.println("❌ Database error in hasUserVoted: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            closeConnection();
        }
    }
}