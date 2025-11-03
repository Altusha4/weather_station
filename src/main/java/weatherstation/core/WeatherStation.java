package weatherstation.core;

import weatherstation.core.observer.Observer;
import weatherstation.core.strategy.UpdateStrategy;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class WeatherStation {
    private List<Observer> observers;
    private UpdateStrategy updateStrategy;
    private WeatherData currentData;

    public WeatherStation() {
        this.observers = new ArrayList<>();
        this.currentData = new WeatherData(20.0, 65.0, 1013.0, 5.0, "Initial");
    }
    public void setUpdateStrategy(UpdateStrategy strategy) {
        this.updateStrategy = strategy;
        System.out.println("Strategy changed to: " + strategy.getStrategyName());
    }
    public void addObserver(Observer observer) {
        observers.add(observer);
        System.out.println("Observer added: " + observer.getName());
    }
    public void updateWeatherData() {
        if (updateStrategy != null) {
            currentData = updateStrategy.getWeatherData();
            notifyObservers();
        }
    }
    private void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(currentData);
        }
    }
    public WeatherData getCurrentData() {
        return currentData;
    }
}