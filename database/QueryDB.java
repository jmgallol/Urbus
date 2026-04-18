import java.sql.*;

public class QueryDB {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        
        String[] check = {"tc_users", "tc_devices", "tc_checkpoints"};
        for (String table : check) {
            try {
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as cnt FROM " + table);
                rs.next();
                int cnt = rs.getInt("cnt");
                System.out.println(table + ": " + cnt + " rows");
                rs.close();
                stmt.close();
            } catch (SQLException e) {
                System.out.println(table + ": MISSING");
            }
        }
        conn.close();
    }
}
