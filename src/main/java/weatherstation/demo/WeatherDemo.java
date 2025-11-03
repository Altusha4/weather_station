package weatherstation.demo;

import weatherstation.core.WeatherStation;
import weatherstation.core.WeatherData;
import weatherstation.core.observer.*;
import weatherstation.core.strategy.*;
import weatherstation.factory.*;
import weatherstation.bridge.*;

public class WeatherDemo {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();

        System.out.println("=== Weather System Demo ===\n");

        System.out.println("1. Creating Observers (Factory Pattern)");
        ObserverFactory mobileFactory = new MobileObserverFactory();
        ObserverFactory webFactory = new WebObserverFactory();
        ObserverFactory smartHomeFactory = new SmartHomeFactory();

        station.addObserver(mobileFactory.createObserver("Weather App"));
        station.addObserver(webFactory.createObserver("Dashboard"));
        station.addObserver(smartHomeFactory.createObserver("Voice Control"));

        System.out.println("\n2. Testing Notifications (Bridge Pattern)");
        NotificationSender pushSender = new PushNotificationSender();
        NotificationSender emailSender = new EmailNotificationSender();

        new UrgentNotification(pushSender).notify("Storm warning!");
        new ScheduledNotification(emailSender).notify("Daily forecast");

        System.out.println("\n3. Testing Strategies:");

        System.out.println("- Real-time Strategy");
        station.setUpdateStrategy(new RealTimeStrategy());
        station.updateWeatherData();
        printWeather(station.getCurrentData());

        System.out.println("- Scheduled Strategy");
        station.setUpdateStrategy(new ScheduledStrategy());
        station.updateWeatherData();
        printWeather(station.getCurrentData());

        System.out.println("- Manual Strategy");
        ManualStrategy manualStrategy = new ManualStrategy();
        manualStrategy.setManualData(25.5, 80.0, 1008.0, 15.0);
        station.setUpdateStrategy(manualStrategy);
        station.updateWeatherData();
        printWeather(station.getCurrentData());

        System.out.println("\n=== Demo Complete ===");
    }

    private static void printWeather(WeatherData data) {
        System.out.println("Weather: " + data.getTemperature() + "°C, " + data.getDescription());
    }
}