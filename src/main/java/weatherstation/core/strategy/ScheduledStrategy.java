package weatherstation.core.strategy;

import weatherstation.core.WeatherData;
import weatherstation.core.RealWeatherService;
import java.time.LocalTime;

public class ScheduledStrategy implements UpdateStrategy {
    private String city;
    private RealWeatherService weatherService;
    public ScheduledStrategy() {
        this.city = "almaty";
        this.weatherService = new RealWeatherService();
    }
    @Override
    public WeatherData getWeatherData() {
        try {
            WeatherData realData = weatherService.getRealWeatherData(city);
            int hour = LocalTime.now().getHour();

            String timeOfDay = getTimeOfDay(hour);
            String description = String.format("%s forecast for %s: %.1f°C, %s",
                    timeOfDay, getCityName(), realData.getTemperature(), realData.getDescription());

            System.out.println("Scheduled forecast for " + city + " - Real data: " + realData.getTemperature() + "°C");

            return new WeatherData(
                    realData.getTemperature(),
                    realData.getHumidity(),
                    realData.getPressure(),
                    realData.getWindSpeed(),
                    description
            );

        } catch (Exception e) {
            System.out.println("API failed, using fallback for " + city);
            return getFallbackData();
        }
    }
    @Override
    public String getStrategyName() {
        return "Real Forecast for " + getCityName();
    }
    private String getTimeOfDay(int hour) {
        if (hour >= 5 && hour < 12) return "Morning";
        if (hour >= 12 && hour < 17) return "Afternoon";
        if (hour >= 17 && hour < 21) return "Evening";
        return "Night";
    }
    private String getCityName() {
        switch (city) {
            case "almaty": return "Almaty";
            case "astana": return "Astana";
            case "shymkent": return "Shymkent";
            case "aktobe": return "Aktobe";
            case "karaganda": return "Karaganda";
            case "aktau": return "Aktau";
            default: return city;
        }
    }
    private WeatherData getFallbackData() {
        return new WeatherData(20, 65, 1013, 5, "Forecast data temporarily unavailable");
    }
}