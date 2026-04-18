import java.sql.*;

public class CheckUsers {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        Statement stmt = conn.createStatement();
        
        try {
            ResultSet rs = stmt.executeQuery("SELECT id, email, name FROM tc_users");
            System.out.println("Users in database:");
            while (rs.next()) {
                System.out.println("- ID: " + rs.getLong("id") + ", Email: " + rs.getString("email") + ", Name: " + rs.getString("name"));
            }
            rs.close();
        } catch (SQLException e) {
            System.out.println("Error querying users: " + e.getMessage());
        }
        
        stmt.close();
        conn.close();
    }
}
