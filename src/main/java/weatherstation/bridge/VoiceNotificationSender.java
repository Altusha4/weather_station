package weatherstation.bridge;

public class VoiceNotificationSender implements NotificationSender {
    @Override
    public void send(String message) {
        System.out.println("Voice Notification: " + message);
    }
}