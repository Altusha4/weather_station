package weatherstation.demo;

import weatherstation.core.WeatherStation;
import weatherstation.core.observer.Observer;
import weatherstation.core.strategy.*;
import weatherstation.factory.*;
import weatherstation.bridge.*;

public class WeatherDemo {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();

        System.out.println("=== Weather Notification System Demo ===");
        System.out.println("Demonstrating 4 Design Patterns:");
        System.out.println("1. Observer Pattern");
        System.out.println("2. Strategy Pattern");
        System.out.println("3. Factory Pattern");
        System.out.println("4. Bridge Pattern\n");

        System.out.println("--- Factory Pattern: Creating Devices ---");
        ObserverFactory mobileFactory = new MobileObserverFactory();
        ObserverFactory webFactory = new WebObserverFactory();

        station.addObserver(mobileFactory.createDisplay());
        station.addObserver(webFactory.createDisplay());

        System.out.println("\n--- Bridge Pattern: Configuring Notifications ---");
        NotificationSender pushSender = new PushNotificationSender();
        Notification urgentPush = new UrgentNotification(pushSender);

        System.out.println("\n--- Strategy: Real-time (on-demand) ---");
        station.setUpdateStrategy(new RealTimeStrategy());
        station.updateWeatherData();

        System.out.println("\n--- Strategy: Scheduled (hourly forecast) ---");
        station.setUpdateStrategy(new ScheduledStrategy());
        station.updateWeatherData();

        System.out.println("\n--- Strategy: Manual Input ---");
        ManualStrategy manualStrategy = new ManualStrategy();
        manualStrategy.setManualData(25.5, 80.0, 1008.0, 15.0);
        station.setUpdateStrategy(manualStrategy);
        station.updateWeatherData();

        System.out.println("\n=== Demo Completed ===");
    }
}