import java.sql.*;

public class CheckDB {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = ManagerManager.getConnection("jdbc:h2:./data/database", "SA", "");
        Statement stmt = conn.createStatement();
        
        try {
            ResultSet tables = stmt.executeQuery("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC'");
            int tcCount = 0;
            while (tables.next()) {
                String name = tables.getString("TABLE_NAME");
                if (name.startsWith("TC_")) {
                    tcCount++;
                }
            }
            System.out.println("Traccar tables created: " + tcCount);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
        
        stmt.close();
        conn.close();
    }
}
