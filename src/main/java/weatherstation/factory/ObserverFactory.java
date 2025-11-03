package weatherstation.factory;

import weatherstation.core.observer.Observer;

public abstract class ObserverFactory {
    public abstract Observer createObserver(String name);
}