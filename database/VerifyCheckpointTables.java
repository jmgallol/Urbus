import java.sql.*;

public class VerifyCheckpointTables {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        Statement stmt = conn.createStatement();
        
        String[] tables = {"tc_checkpoints", "tc_user_checkpoint", "tc_group_checkpoint"};
        
        for (String table : tables) {
            try {
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as count FROM " + table);
                if (rs.next()) {
                    int count = rs.getInt("count");
                    System.out.println(table + ": EXISTS (rows: " + count + ")");
                }
                rs.close();
            } catch (SQLException e) {
                System.out.println(table + ": NOT FOUND");
            }
        }
        
        stmt.close();
        conn.close();
    }
}
