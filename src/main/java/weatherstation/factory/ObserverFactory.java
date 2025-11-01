package weatherstation.factory;

import weatherstation.core.observer.Observer;

public abstract class ObserverFactory {
    public abstract Observer createDisplay();
    public abstract Observer createNotifier();
    public abstract Observer createController();
}