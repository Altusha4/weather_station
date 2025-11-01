package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public interface UpdateStrategy {
    WeatherData getWeatherData();
    String getStrategyName();
}