package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.SmartHomeObserver;

public class SmartHomeFactory extends ObserverFactory {
    @Override
    public Observer createDisplay() {
        return new SmartHomeObserver("Wall Display");
    }

    @Override
    public Observer createNotifier() {
        return new SmartHomeObserver("Voice Assistant");
    }

    @Override
    public Observer createController() {
        return new SmartHomeObserver("Climate Control");
    }
}