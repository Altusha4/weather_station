package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class ManualStrategy implements UpdateStrategy {
    private WeatherData manualData;

    public ManualStrategy() {
        this.manualData = new WeatherData(20.0, 65.0, 1013.0, 5.0, "Manual Input");
    }

    public void setManualData(double temp, double humidity, double pressure, double windSpeed, String description) {
        this.manualData = new WeatherData(temp, humidity, pressure, windSpeed, description);
    }

    @Override
    public WeatherData getWeatherData() {
        return manualData;
    }

    @Override
    public String getStrategyName() {
        return "Manual Input";
    }
}