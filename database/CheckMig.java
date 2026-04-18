import java.sql.*;

public class CheckMig {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as cnt FROM DATABASECHANGELOG");
            rs.next();
            System.out.println("Total changesets: " + rs.getInt("cnt"));
            rs.close();
            stmt.close();
            
            String[] tables = {"tc_checkpoints", "tc_user_checkpoint", "tc_group_checkpoint", "tc_users"};
            for (String table : tables) {
                try {
                    Statement s = conn.createStatement();
                    ResultSet r = s.executeQuery("SELECT COUNT(*) as c FROM " + table);
                    r.next();
                    System.out.println("? " + table);
                    r.close();
                    s.close();
                } catch (SQLException e) {
                    System.out.println("? " + table);
                }
            }
        } finally {
            conn.close();
        }
    }
}
