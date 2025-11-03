package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class RealTimeStrategy implements UpdateStrategy {
    @Override
    public WeatherData getWeatherData() {
        return new WeatherData(20, 65, 1013, 5, "Real-time Data");
    }
    @Override
    public String getStrategyName() {
        return "Real-time Strategy";
    }
}