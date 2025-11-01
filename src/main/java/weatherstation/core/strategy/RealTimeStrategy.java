package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class RealTimeStrategy implements UpdateStrategy {
    private int updateCount = 0;
    @Override
    public WeatherData getWeatherData() {
        updateCount++;
        double baseTemp = 18 + (Math.random() * 15); // 18-33°C
        double humidity = 50 + (Math.random() * 40); // 50-90%
        double pressure = 1005 + (Math.random() * 20); // 1005-1025 hPa
        double windSpeed = 2 + (Math.random() * 18); // 2-20 km/h
        String description = getWeatherDescription(baseTemp);

        System.out.println("Real-time update #" + updateCount + ": " + baseTemp + "°C");
        return new WeatherData(baseTemp, humidity, pressure, windSpeed, description);
    }
    @Override
    public String getStrategyName() {
        return "Real-time Update";
    }
    private String getWeatherDescription(double temp) {
        if (temp > 28) return "Hot ☀️";
        if (temp > 24) return "Warm 🌤️";
        if (temp > 18) return "Mild ⛅";
        if (temp > 12) return "Cool 🌥️";
        return "Chilly 🌧️";
    }
}