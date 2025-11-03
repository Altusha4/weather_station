package weatherstation.factory;

import weatherstation.core.observer.Observer;
import weatherstation.core.observer.WebsiteObserver;

public class WebObserverFactory extends ObserverFactory {
    @Override
    public Observer createObserver(String name) {
        return new WebsiteObserver("Web: " + name);
    }
}