import java.sql.*;

public class FinalCheckDB {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        DatabaseMetaData metaData = conn.getMetaData();
        
        System.out.println("=== Database Schema ===\n");
        
        String[] tableTypes = {"tc_checkpoints", "tc_user_checkpoint", "tc_group_checkpoint", "tc_users"};
        
        for (String tableName : tableTypes) {
            try {
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM " + tableName);
                if (rs.next()) {
                    System.out.println("? " + tableName + " (rows: " + rs.getInt("count") + ")");
                }
                rs.close();
                stmt.close();
            } catch (SQLException e) {
                System.out.println("? " + tableName + " not found");
            }
        }
        
        // List all TC_ tables
        System.out.println("\nAll TC_ tables:");
        ResultSet tables = metaData.getTables(null, null, "TC_%", new String[]{"TABLE"});
        int count = 0;
        while (tables.next() && count < 20) {
            System.out.println("  - " + tables.getString("TABLE_NAME"));
            count++;
        }
        if (count >= 20) {
            System.out.println("  ... (more tables)");
        }
        tables.close();
        
        conn.close();
    }
}
