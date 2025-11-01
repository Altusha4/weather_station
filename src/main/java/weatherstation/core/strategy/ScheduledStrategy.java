package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class ScheduledStrategy implements UpdateStrategy {
    private int updateCount = 0;
    private WeatherData[] hourlyData = {
            new WeatherData(16.0, 70.0, 1015.0, 5.0, "🌅 Morning: 16°C, Partly Cloudy"),
            new WeatherData(22.0, 60.0, 1013.0, 8.0, "☀️ Noon: 22°C, Sunny"),
            new WeatherData(19.0, 65.0, 1014.0, 12.0, "🌇 Evening: 19°C, Breezy"),
            new WeatherData(14.0, 75.0, 1016.0, 3.0, "🌙 Night: 14°C, Clear")
    };
    @Override
    public WeatherData getWeatherData() {
        updateCount++;
        WeatherData data = hourlyData[updateCount % hourlyData.length];
        System.out.println("Scheduled forecast: " + data.getDescription());
        return data;
    }
    @Override
    public String getStrategyName() {
        return "Hourly Forecast";
    }
}