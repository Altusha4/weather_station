package weatherstation.bridge;

public interface NotificationSender {
    void send(String message);
    String getType();
}