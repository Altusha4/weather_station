package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class ScheduledStrategy implements UpdateStrategy {
    private int updateCount = 0;
    private double[] predefinedTemps = {22.0, 18.5, 25.0, 16.0, 20.5};

    @Override
    public WeatherData getWeatherData() {
        double temp = predefinedTemps[updateCount % predefinedTemps.length];
        double humidity = 65 + (Math.random() * 10);
        double pressure = 1015;
        double windSpeed = 10;
        String description = "Scheduled Update";

        updateCount++;
        return new WeatherData(temp, humidity, pressure, windSpeed, description);
    }

    @Override
    public String getStrategyName() {
        return "Scheduled Updates";
    }
}