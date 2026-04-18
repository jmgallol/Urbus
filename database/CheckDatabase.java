import java.sql.*;

public class CheckDatabase {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        DatabaseMetaData metaData = conn.getMetaData();
        
        ResultSet tables = metaData.getTables(null, null, "TC_%", new String[]{"TABLE"});
        System.out.println("Traccar tables:");
        int count = 0;
        while (tables.next()) {
            System.out.println("- " + tables.getString("TABLE_NAME"));
            count++;
        }
        tables.close();
        
        if (count > 0) {
            // Check if users table has data
            Statement stmt = conn.createStatement();
            try {
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM tc_users");
                rs.next();
                System.out.println("\\nUsers in DB: " + rs.getInt("count"));
                rs.close();
            } catch (SQLException e) {
                System.out.println("Error: " + e.getMessage());
            }
            stmt.close();
        } else {
            System.out.println("No Traccar tables found!");
        }
        
        conn.close();
    }
}
