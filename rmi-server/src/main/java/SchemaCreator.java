import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class SchemaCreator {

    // Database Config
    private static final String URL = "jdbc:mysql://localhost:3306/votingdb";
    private static final String USER = "root";
    private static final String PASSWORD = "root";

    public static void main(String[] args) {
        // SQL Statements defined in order of dependency (Parents first, then Children)

        // 1. Events Table
        String sqlEvents = """
            CREATE TABLE IF NOT EXISTS events (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        """;

        // 2. Users Table (References Events)
        // Note: Password storage size depends on AES encoding (Base64/Hex). 255 is usually safe.
        String sqlUsers = """
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                event_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """;

        // 3. Candidates Table (References Events)
        // Note: BLOB can hold up to 65KB. Use MEDIUMBLOB (16MB) if photos are high res.
        String sqlCandidates = """
            CREATE TABLE IF NOT EXISTS candidates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                photo MEDIUMBLOB,
                event_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """;

        // 4. Votes Table (References Users, Candidates, and Events)
        // Composite Primary Key (user_id, event_id) ensures a user can only vote once per event.
        String sqlVotes = """
            CREATE TABLE IF NOT EXISTS votes (
                user_id VARCHAR(36) NOT NULL,
                candidate_id INT NOT NULL,
                event_id VARCHAR(36) NOT NULL,
                PRIMARY KEY (user_id, event_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
            )
        """;

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to database...");

            // Execute creation steps
            stmt.execute(sqlEvents);
            System.out.println("Created 'events' table.");

            stmt.execute(sqlUsers);
            System.out.println("Created 'users' table.");

            stmt.execute(sqlCandidates);
            System.out.println("Created 'candidates' table.");

            stmt.execute(sqlVotes);
            System.out.println("Created 'votes' table.");

            System.out.println("Schema creation complete successfully!");

        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}