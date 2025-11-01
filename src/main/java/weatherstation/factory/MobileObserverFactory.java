package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.MobileAppObserver;

public class MobileObserverFactory extends ObserverFactory {
    @Override
    public Observer createDisplay() {
        return new MobileAppObserver("Weather Display");
    }

    @Override
    public Observer createNotifier() {
        return new MobileAppObserver("Push Notifications");
    }

    @Override
    public Observer createController() {
        return new MobileAppObserver("Quick Controls");
    }
}