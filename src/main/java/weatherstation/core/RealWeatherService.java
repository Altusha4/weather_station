package weatherstation.core;

import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class RealWeatherService {
    private final String API_KEY = "2060f95a3a37ed4383b1d276a26fdad1";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public WeatherData getRealWeatherData(String city) {
        try {
            String url = buildWeatherUrl(city);
            String response = restTemplate.getForObject(url, String.class);
            return parseWeatherData(response, city);
        } catch (Exception e) {
            return getFallbackData(city);
        }
    }
    private String buildWeatherUrl(String city) {
        Map<String, String> cityCoords = Map.of(
                "almaty", "43.2565,76.9285",
                "astana", "51.1694,71.4491",
                "shymkent", "42.3417,69.5901",
                "aktobe", "50.2833,57.1667",
                "karaganda", "49.8019,73.1021",
                "aktau", "43.6416,51.1717"
        );

        String coords = cityCoords.getOrDefault(city, "43.2565,76.9285");
        return String.format(
                "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric",
                coords.split(",")[0], coords.split(",")[1], API_KEY
        );
    }
    private WeatherData parseWeatherData(String jsonResponse, String city) throws Exception {
        JsonNode root = mapper.readTree(jsonResponse);

        double temp = root.path("main").path("temp").asDouble();
        double humidity = root.path("main").path("humidity").asDouble();
        double pressure = root.path("main").path("pressure").asDouble();
        double windSpeed = root.path("wind").path("speed").asDouble() * 3.6;

        String description = root.path("weather").get(0).path("description").asText();
        description = description.substring(0, 1).toUpperCase() + description.substring(1);

        return new WeatherData(temp, humidity, pressure, windSpeed, description);
    }

    private WeatherData getFallbackData(String city) {
        Map<String, WeatherData> fallback = Map.of(
                "almaty", new WeatherData(22, 65, 1010, 8, "Sunny"),
                "astana", new WeatherData(18, 70, 1015, 12, "Cloudy"),
                "shymkent", new WeatherData(26, 55, 1008, 6, "Clear"),
                "aktobe", new WeatherData(20, 60, 1012, 10, "Partly Cloudy"),
                "karaganda", new WeatherData(16, 75, 1018, 8, "Overcast"),
                "aktau", new WeatherData(24, 65, 1011, 15, "Windy")
        );
        return fallback.getOrDefault(city, new WeatherData(20, 65, 1013, 5, "Clear"));
    }
}