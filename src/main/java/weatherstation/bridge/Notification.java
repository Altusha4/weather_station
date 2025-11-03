package weatherstation.bridge;

public abstract class Notification {
    protected NotificationSender sender;
    public Notification(NotificationSender sender) {
        this.sender = sender;
    }
    public abstract void notify(String weatherData);
}