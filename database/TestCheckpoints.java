import java.io.*;
import java.net.*;

public class TestCheckpoints {
    public static void main(String[] args) throws Exception {
        // Login
        URL url = new URL("http://localhost:8082/api/session");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);
        
        String body = "email=admin99999@test&password=password123";
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes("UTF-8"));
        }
        
        int status = conn.getResponseCode();
        System.out.println("Login status: " + status);
        if (status == 200) {
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
            System.out.println("Response: " + response.toString());
        } else {
            BufferedReader br = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
            System.out.println("Error: " + response.toString());
        }
    }
}
