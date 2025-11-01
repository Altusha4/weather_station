package weatherstation.core.strategy;

import weatherstation.core.WeatherData;

public class ManualStrategy implements UpdateStrategy {
    private WeatherData manualData;

    public ManualStrategy() {
        this.manualData = new WeatherData(20.0, 65.0, 1013.0, 5.0, "Manual Input");
    }
    public void setManualData(double temp, double humidity, double pressure, double windSpeed) {
        if (!isValidData(temp, humidity, pressure, windSpeed)) {
            System.out.println("=== MANUAL STRATEGY - INVALID DATA REJECTED ===");
            System.out.println("Invalid manual data detected:");
            System.out.println("Temperature: " + temp + "°C" + (temp < -60 || temp > 60 ? " ❌" : " ✅"));
            System.out.println("Humidity: " + humidity + "%" + (humidity < 0 || humidity > 100 ? " ❌" : " ✅"));
            System.out.println("Pressure: " + pressure + " hPa" + (pressure < 870 || pressure > 1085 ? " ❌" : " ✅"));
            System.out.println("Wind Speed: " + windSpeed + " km/h" + (windSpeed < 0 || windSpeed > 150 ? " ❌" : " ✅"));
            System.out.println("Data was NOT applied. Please enter valid values.");
            System.out.println("=====================");
            return;
        }
        double validatedTemp = validateTemperature(temp);
        double validatedHumidity = validateHumidity(humidity);
        double validatedPressure = validatePressure(pressure);
        double validatedWindSpeed = validateWindSpeed(windSpeed);

        String description = generateDescription(validatedTemp, validatedHumidity, validatedWindSpeed);

        this.manualData = new WeatherData(validatedTemp, validatedHumidity, validatedPressure, validatedWindSpeed, description);

        System.out.println("=== MANUAL STRATEGY ===");
        System.out.println("Manual data applied:");
        System.out.println("Temperature: " + validatedTemp + "°C ✅");
        System.out.println("Humidity: " + validatedHumidity + "% ✅");
        System.out.println("Pressure: " + validatedPressure + " hPa ✅");
        System.out.println("Wind Speed: " + validatedWindSpeed + " km/h ✅");
        System.out.println("Description: " + description + " ✅");
        System.out.println("=====================");
    }
    private boolean isValidData(double temp, double humidity, double pressure, double windSpeed) {
        return temp >= -60 && temp <= 60 &&
                humidity >= 0 && humidity <= 100 &&
                pressure >= 870 && pressure <= 1085 &&
                windSpeed >= 0 && windSpeed <= 150;
    }
    private double validateTemperature(double temp) {
        if (temp < -60) return -60;
        if (temp > 60) return 60;
        return Math.round(temp * 10.0) / 10.0;
    }
    private double validateHumidity(double humidity) {
        if (humidity < 0) return 0;
        if (humidity > 100) return 100;
        return Math.round(humidity * 10.0) / 10.0;
    }
    private double validatePressure(double pressure) {
        if (pressure < 870) return 870;
        if (pressure > 1085) return 1085;
        return Math.round(pressure);
    }
    private double validateWindSpeed(double windSpeed) {
        if (windSpeed < 0) return 0;
        if (windSpeed > 150) return 150;
        return Math.round(windSpeed * 10.0) / 10.0;
    }
    private String generateDescription(double temp, double humidity, double windSpeed) {
        String tempDesc = temp > 25 ? "Hot" : temp > 15 ? "Warm" : temp > 5 ? "Cool" : "Cold";
        String windDesc = windSpeed > 20 ? "Windy" : windSpeed > 10 ? "Breezy" : "Calm";
        return tempDesc + ", " + windDesc + " (" + humidity + "% humidity)";
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