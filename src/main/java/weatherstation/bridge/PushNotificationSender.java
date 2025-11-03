package weatherstation.bridge;

public class PushNotificationSender implements NotificationSender {
    @Override
    public void send(String message) {
        System.out.println("Push Notification: " + message);
    }
}