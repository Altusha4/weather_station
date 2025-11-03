package weatherstation.controller;

import weatherstation.core.WeatherStation;
import weatherstation.core.WeatherData;
import weatherstation.core.strategy.*;
import weatherstation.core.RealWeatherService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {
    @Autowired
    private WeatherStation weatherStation;

    @GetMapping("/real/{city}")
    public WeatherData getRealWeather(@PathVariable String city) {
        RealWeatherService weatherService = new RealWeatherService();
        return weatherService.getRealWeatherData(city);
    }

    @PostMapping("/strategy/realtime")
    public WeatherData setRealTime(@RequestParam(defaultValue = "almaty") String city) {
        try {
            RealWeatherService weatherService = new RealWeatherService();
            WeatherData realData = weatherService.getRealWeatherData(city);

            UpdateStrategy strategy = new UpdateStrategy() {
                @Override
                public String getStrategyName() {
                    return "Real-time Weather (" + city + ")";
                }
                @Override
                public WeatherData getWeatherData() {
                    return realData;
                }
            };

            weatherStation.setUpdateStrategy(strategy);
            weatherStation.updateWeatherData();

            System.out.println("Real-time strategy activated with real data for " + city + ": " + realData.getTemperature() + "°C");
            return weatherStation.getCurrentData();

        } catch (Exception e) {
            System.out.println("Using fallback real-time strategy");
            UpdateStrategy fallbackStrategy = new UpdateStrategy() {
                private int updateCount = 0;
                private double lastTemperature = 20.0;

                @Override
                public String getStrategyName() {
                    return "Real-time Simulation (Fallback)";
                }

                @Override
                public WeatherData getWeatherData() {
                    updateCount++;
                    double tempChange = (Math.random() * 2 - 1) * 0.5;
                    lastTemperature = Math.max(-10, Math.min(35, lastTemperature + tempChange));

                    double humidity = 60 + (Math.random() * 20);
                    double pressure = 1010 + (Math.random() * 10);
                    double windSpeed = 5 + (Math.random() * 10);

                    String description = "Simulated: " + String.format("%.1f°C", lastTemperature);

                    System.out.println("Fallback real-time update #" + updateCount + ": " + lastTemperature + "°C");

                    return new WeatherData(lastTemperature, humidity, pressure, windSpeed, description);
                }
            };
            weatherStation.setUpdateStrategy(fallbackStrategy);
            weatherStation.updateWeatherData();
            return weatherStation.getCurrentData();
        }
    }

    @PostMapping("/strategy/scheduled")
    public WeatherData setScheduled(@RequestParam(defaultValue = "almaty") String city) {
        try {
            UpdateStrategy strategy = new UpdateStrategy() {
                private RealWeatherService weatherService = new RealWeatherService();

                @Override
                public String getStrategyName() {
                    return "Scheduled Forecast (" + city + ")";
                }
                @Override
                public WeatherData getWeatherData() {
                    try {
                        WeatherData currentRealData = weatherService.getRealWeatherData(city);

                        String timeOfDay = getTimeOfDay();
                        String description = timeOfDay + " forecast for " + city + ": " +
                                String.format("%.1f", currentRealData.getTemperature()) + "°C, " +
                                currentRealData.getDescription();

                        System.out.println("Scheduled forecast for " + city + " - FRESH DATA: " +
                                currentRealData.getTemperature() + "°C");

                        return new WeatherData(
                                currentRealData.getTemperature(),
                                currentRealData.getHumidity(),
                                currentRealData.getPressure(),
                                currentRealData.getWindSpeed(),
                                description
                        );
                    } catch (Exception e) {
                        System.out.println("API call failed in scheduled strategy");
                        return getFallbackData(city);
                    }
                }

                private String getTimeOfDay() {
                    int hour = java.time.LocalTime.now().getHour();
                    if (hour >= 5 && hour < 12) return "Morning";
                    if (hour >= 12 && hour < 17) return "Afternoon";
                    if (hour >= 17 && hour < 21) return "Evening";
                    return "Night";
                }

                private WeatherData getFallbackData(String city) {
                    return new WeatherData(20, 65, 1013, 5, "Forecast data unavailable for " + city);
                }
            };

            weatherStation.setUpdateStrategy(strategy);
            weatherStation.updateWeatherData();

            System.out.println("Scheduled strategy activated for " + city);
            return weatherStation.getCurrentData();

        } catch (Exception e) {
            System.out.println("Using fallback scheduled strategy");
            weatherStation.setUpdateStrategy(new ScheduledStrategy());
            weatherStation.updateWeatherData();
            return weatherStation.getCurrentData();
        }
    }

    @PostMapping("/strategy/manual")
    public WeatherData setManual(@RequestBody ManualRequest request) {
        ManualStrategy strategy = new ManualStrategy();
        strategy.setManualData(request.temp, request.humidity, request.pressure, request.wind);
        weatherStation.setUpdateStrategy(strategy);
        weatherStation.updateWeatherData();

        System.out.println("Manual strategy activated with custom data");
        return weatherStation.getCurrentData();
    }

    @GetMapping("/current")
    public WeatherData getCurrent() {
        return weatherStation.getCurrentData();
    }

    @GetMapping("/forecast/{city}")
    public java.util.List<WeatherData> getForecast(@PathVariable String city) {
        RealWeatherService weatherService = new RealWeatherService();
        return java.util.Arrays.asList(
                weatherService.getRealWeatherData(city),
                weatherService.getRealWeatherData(city),
                weatherService.getRealWeatherData(city)
        );
    }

    @GetMapping("/cities")
    public java.util.List<String> getSupportedCities() {
        return java.util.Arrays.asList("almaty", "astana", "shymkent", "aktobe", "karaganda", "aktau");
    }

    @PostMapping("/refresh")
    public WeatherData refreshWeather(@RequestParam(defaultValue = "almaty") String city) {
        try {
            RealWeatherService weatherService = new RealWeatherService();
            WeatherData freshData = weatherService.getRealWeatherData(city);

            weatherStation.setUpdateStrategy(new UpdateStrategy() {
                @Override
                public String getStrategyName() {
                    return "Refreshed Data";
                }
                @Override
                public WeatherData getWeatherData() {
                    return freshData;
                }
            });
            weatherStation.updateWeatherData();

            System.out.println("Weather data refreshed for " + city);
            return freshData;
        } catch (Exception e) {
            System.out.println("Refresh failed, returning current data");
            return weatherStation.getCurrentData();
        }
    }
}

class ManualRequest {
    public double temp;
    public double humidity;
    public double pressure;
    public double wind;
}