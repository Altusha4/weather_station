package weatherstation.bridge;

public class EmailNotificationSender implements NotificationSender {
    @Override
    public void send(String message) {
        System.out.println("Email Notification: " + message);
    }

    @Override
    public String getType() {
        return "EMAIL";
    }
}