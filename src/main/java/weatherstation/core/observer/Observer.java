package weatherstation.core.observer;

import weatherstation.core.WeatherData;

public interface Observer {
    void update(WeatherData data);
    String getName();
}