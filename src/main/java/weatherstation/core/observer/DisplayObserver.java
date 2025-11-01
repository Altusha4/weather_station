package weatherstation.core.observer;

import weatherstation.core.WeatherData;
import weatherstation.bridge.Notification;

public abstract class DisplayObserver implements Observer {
    protected String name;
    protected Notification notification;

    public DisplayObserver(String name) {
        this.name = name;
    }

    public void setNotification(Notification notification) {
        this.notification = notification;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void update(WeatherData data) {
        System.out.println(name + " received: " + data);
        if (notification != null) {
            notification.notify(data.toString());
        }
    }
}