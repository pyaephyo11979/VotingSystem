import java.sql.*;

public class DatabaseTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/votingdb";
        String username = "root";
        String password = "root";

        System.out.println("Testing database connection...");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("✅ MySQL driver loaded successfully");

            Connection conn = DriverManager.getConnection(url, username, password);
            System.out.println("✅ Database connection successful");

            // Test creating an event
            String query = "INSERT INTO events (id, name, password) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(query);
            stmt.setString(1, "TEST123");
            stmt.setString(2, "Test Event");
            stmt.setString(3, "testpass");

            int rowsAffected = stmt.executeUpdate();
            System.out.println("✅ Event created successfully. Rows affected: " + rowsAffected);

            // Clean up test data
            PreparedStatement deleteStmt = conn.prepareStatement("DELETE FROM events WHERE id = ?");
            deleteStmt.setString(1, "TEST123");
            deleteStmt.executeUpdate();
            System.out.println("✅ Test data cleaned up");

            conn.close();
            System.out.println("✅ All tests passed!");

        } catch (ClassNotFoundException e) {
            System.err.println("❌ MySQL driver not found: " + e.getMessage());
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("❌ Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}