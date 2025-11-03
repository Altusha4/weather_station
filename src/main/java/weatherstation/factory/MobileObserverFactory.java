package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.MobileAppObserver;

public class MobileObserverFactory extends ObserverFactory {
    @Override
    public Observer createObserver(String name) {
        return new MobileAppObserver("Mobile: " + name);
    }
}