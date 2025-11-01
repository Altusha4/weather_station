package weatherstation.core;

public class WeatherData {
    private double temperature;
    private double humidity;
    private double pressure;
    private double windSpeed;
    private String description;

    public WeatherData(double temperature, double humidity, double pressure,
                       double windSpeed, String description) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        this.windSpeed = windSpeed;
        this.description = description;
    }

    public double getTemperature() { return temperature; }
    public double getHumidity() { return humidity; }
    public double getPressure() { return pressure; }
    public double getWindSpeed() { return windSpeed; }
    public String getDescription() { return description; }

    @Override
    public String toString() {
        return String.format("Temperature: %.1fC | Humidity: %.1f%% | Pressure: %.1fhPa | Wind: %.1fkm/h | %s",
                temperature, humidity, pressure, windSpeed, description);
    }
}