import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DBAdminUpdate {
    public static void main(String[] args) throws Exception {
        String hash = "$2a$10$AGH9Fo2l52hhf5.CZkkvUu8cpDylYxe2s2lpXNdRSM5RhtcBpxwhG";
        Connection conn = DriverManager.getConnection(
            "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslMode=VERIFY_IDENTITY",
            "JExG9WZXgmGv2Sv.root",
            "U7MUd37GPeYQyA9Z"
        );
        Statement stmt = conn.createStatement();
        int rows = stmt.executeUpdate("UPDATE hostel_users SET password = '" + hash + "' WHERE username = 'admin'");
        System.out.println("Updated " + rows + " admin rows with new password hash.");
        conn.close();
    }
}
