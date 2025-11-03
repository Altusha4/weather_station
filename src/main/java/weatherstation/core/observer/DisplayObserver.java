package weatherstation.core.observer;

import weatherstation.core.WeatherData;

public abstract class DisplayObserver implements Observer {
    protected String name;
    public DisplayObserver(String name) {
        this.name = name;
    }
    @Override
    public String getName() {
        return name;
    }
    @Override
    public void update(WeatherData data) {
        System.out.println(name + " received: " + data);
    }
}