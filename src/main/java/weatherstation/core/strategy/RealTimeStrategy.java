package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class RealTimeStrategy implements UpdateStrategy {
    private double baseTemp = 20.0;

    @Override
    public WeatherData getWeatherData() {
        baseTemp += (Math.random() - 0.5) * 2;
        double humidity = 60 + (Math.random() * 20);
        double pressure = 1010 + (Math.random() * 10);
        double windSpeed = 5 + (Math.random() * 15);
        String description = getWeatherDescription(baseTemp);

        return new WeatherData(baseTemp, humidity, pressure, windSpeed, description);
    }

    @Override
    public String getStrategyName() {
        return "Real-time Sensor";
    }

    private String getWeatherDescription(double temp) {
        if (temp > 25) return "Sunny";
        if (temp > 15) return "Partly Cloudy";
        return "Cloudy";
    }
}