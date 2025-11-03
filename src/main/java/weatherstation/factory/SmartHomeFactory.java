package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.SmartHomeObserver;

public class SmartHomeFactory extends ObserverFactory {
    @Override
    public Observer createObserver(String name) {
        return new SmartHomeObserver("SmartHome: " + name);
    }
}