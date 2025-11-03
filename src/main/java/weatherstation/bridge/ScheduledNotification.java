package weatherstation.bridge;

public class ScheduledNotification extends Notification {
    public ScheduledNotification(NotificationSender sender) {
        super(sender);
    }
    @Override
    public void notify(String weatherData) {
        String message = "Scheduled Update: " + weatherData;
        sender.send(message);
    }
}