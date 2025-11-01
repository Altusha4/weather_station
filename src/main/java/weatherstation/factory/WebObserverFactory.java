package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.WebsiteObserver;

public class WebObserverFactory extends ObserverFactory {
    @Override
    public Observer createDisplay() {
        return new WebsiteObserver("Dashboard");
    }

    @Override
    public Observer createNotifier() {
        return new WebsiteObserver("Alert Panel");
    }

    @Override
    public Observer createController() {
        return new WebsiteObserver("Settings Panel");
    }
}