import java.sql.*;

public class ListTables {
    public static void main(String[] args) throws Exception {
        Class.forName("org.h2.Driver");
        Connection conn = DriverManager.getConnection("jdbc:h2:./data/database", "SA", "");
        DatabaseMetaData metaData = conn.getMetaData();
        
        ResultSet tables = metaData.getTables(null, null, "%", new String[]{"TABLE"});
        System.out.println("Tables in database:");
        while (tables.next()) {
            System.out.println("- " + tables.getString("TABLE_NAME"));
        }
        tables.close();
        
        conn.close();
    }
}
