package weatherstation.bridge;

public class UrgentNotification extends Notification {
    public UrgentNotification(NotificationSender sender) {
        super(sender);
    }
    @Override
    public void notify(String weatherData) {
        String message = "URGENT: " + weatherData;
        sender.send(message);
    }
}