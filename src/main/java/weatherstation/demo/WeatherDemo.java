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

        // Factory Pattern: создаем устройства
        System.out.println("--- Factory Pattern: Creating Devices ---");
        ObserverFactory mobileFactory = new MobileObserverFactory();
        ObserverFactory webFactory = new WebObserverFactory();
        ObserverFactory smartHomeFactory = new SmartHomeFactory();

        // Добавляем наблюдателей
        station.addObserver(mobileFactory.createDisplay());
        station.addObserver(webFactory.createDisplay());
        station.addObserver(smartHomeFactory.createController());

        // Bridge Pattern: настраиваем уведомления
        System.out.println("\n--- Bridge Pattern: Configuring Notifications ---");
        NotificationSender pushSender = new PushNotificationSender();
        NotificationSender voiceSender = new VoiceNotificationSender();

        Notification urgentPush = new UrgentNotification(pushSender);
        Notification scheduledVoice = new ScheduledNotification(voiceSender);

        // Strategy Pattern: демонстрация смены стратегий
        System.out.println("\n--- Strategy Pattern: Real-time Updates ---");
        station.setUpdateStrategy(new RealTimeStrategy());
        simulateUpdates(station, 2);

        System.out.println("\n--- Strategy Pattern: Scheduled Updates ---");
        station.setUpdateStrategy(new ScheduledStrategy());
        simulateUpdates(station, 2);

        System.out.println("\n--- Strategy Pattern: Manual Input ---");
        ManualStrategy manualStrategy = new ManualStrategy();
        manualStrategy.setManualData(30.0, 40.0, 1005.0, 20.0, "Heat Wave");
        station.setUpdateStrategy(manualStrategy);
        simulateUpdates(station, 1);

        System.out.println("\n=== Demo Completed Successfully ===");
    }

    private static void simulateUpdates(WeatherStation station, int count) {
        for (int i = 0; i < count; i++) {
            try {
                Thread.sleep(2000);
                station.updateWeatherData();
                System.out.println("--- Update " + (i + 1) + " completed ---");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}