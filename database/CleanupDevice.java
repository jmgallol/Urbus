import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class CleanupDevice {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        
        String uniqueId = "11436686";
        
        try {
            // First, check if device exists
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT ID, NAME, UNIQUEID FROM TC_DEVICES WHERE UNIQUEID = '" + uniqueId + "'");
            
            System.out.println("Searching for device with uniqueId: " + uniqueId);
            boolean found = false;
            
            while (rs.next()) {
                found = true;
                int deviceId = rs.getInt("ID");
                String name = rs.getString("NAME");
                System.out.println("Found: ID=" + deviceId + ", NAME=" + name + ", UNIQUEID=" + rs.getString("UNIQUEID"));
                
                // Delete associated records first
                System.out.println("Deleting related records...");
                
                // Delete from route-related tables if needed
                try {
                    stmt.execute("DELETE FROM TC_DEVICE_ROUTES WHERE DEVICE_ID = " + deviceId);
                    System.out.println("  - Deleted device routes");
                } catch (Exception e) {
                    System.out.println("  - No device routes to delete");
                }
                
                // Delete the device
                stmt.execute("DELETE FROM TC_DEVICES WHERE ID = " + deviceId);
                System.out.println("  - Deleted device record");
            }
            
            if (!found) {
                System.out.println("No device found with uniqueId: " + uniqueId);
            } else {
                System.out.println("\nCleanup completed successfully!");
            }
            
            rs.close();
            stmt.close();
            
        } catch (SQLException e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            conn.close();
        }
    }
}
