class WeatherSimulator {
    constructor() {
        this.observers = [];
        this.currentStrategy = 'realtime';
        this.weatherData = {
            temperature: 20,
            humidity: 65,
            pressure: 1013,
            windSpeed: 5,
            description: 'Sunny'
        };
        this.eventLog = [];
        this.notifications = [];
        this.updateInterval = null;

        this.initializeEventListeners();
        this.startRealTimeUpdates();
    }

    initializeEventListeners() {
        document.getElementById('realtime-btn').addEventListener('click', () => this.setStrategy('realtime'));
        document.getElementById('scheduled-btn').addEventListener('click', () => this.setStrategy('scheduled'));
        document.getElementById('manual-btn').addEventListener('click', () => this.setStrategy('manual'));

        document.getElementById('mobile-factory').addEventListener('click', () => this.addMobileDevices());
        document.getElementById('web-factory').addEventListener('click', () => this.addWebComponents());
        document.getElementById('smarthome-factory').addEventListener('click', () => this.addSmartHome());

        document.getElementById('update-manual').addEventListener('click', () => this.updateManualData());

        document.getElementById('notification-type').addEventListener('change', () => this.updateBridgeConfig());
        document.getElementById('sender-type').addEventListener('change', () => this.updateBridgeConfig());
    }

    setStrategy(strategy) {
        this.currentStrategy = strategy;

        document.querySelectorAll('.strategy-buttons .btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${strategy}-btn`).classList.add('active');

        this.logEvent(`Strategy changed to: ${strategy}`);

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        switch(strategy) {
            case 'realtime':
                this.startRealTimeUpdates();
                break;
            case 'scheduled':
                this.startScheduledUpdates();
                break;
            case 'manual':
                break;
        }
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.generateRealTimeData();
            this.updateWeatherDisplay();
            this.notifyObservers();
        }, 3000);
    }

    startScheduledUpdates() {
        this.updateInterval = setInterval(() => {
            this.generateScheduledData();
            this.updateWeatherDisplay();
            this.notifyObservers();
        }, 10000);
    }

    generateRealTimeData() {
        this.weatherData.temperature += (Math.random() - 0.5) * 2;
        this.weatherData.temperature = Math.max(-10, Math.min(40, this.weatherData.temperature));
        this.weatherData.humidity = 60 + Math.random() * 20;
        this.weatherData.pressure = 1010 + Math.random() * 10;
        this.weatherData.windSpeed = 5 + Math.random() * 15;
        this.weatherData.description = this.getWeatherDescription(this.weatherData.temperature);

        this.logEvent('Real-time data generated');
    }

    generateScheduledData() {
        const temps = [22.0, 18.5, 25.0, 16.0, 20.5];
        this.weatherData.temperature = temps[Math.floor(Math.random() * temps.length)];
        this.weatherData.humidity = 65 + Math.random() * 10;
        this.weatherData.description = 'Scheduled Update';

        this.logEvent('Scheduled data generated');
    }

    getWeatherDescription(temp) {
        if (temp > 25) return 'Sunny';
        if (temp > 15) return 'Partly Cloudy';
        return 'Cloudy';
    }

    updateManualData() {
        const temp = parseFloat(document.getElementById('manual-temp').value) || this.weatherData.temperature;
        const humidity = parseFloat(document.getElementById('manual-humidity').value) || this.weatherData.humidity;

        this.weatherData.temperature = temp;
        this.weatherData.humidity = humidity;
        this.weatherData.description = 'Manual Input';

        this.updateWeatherDisplay();
        this.notifyObservers();
        this.logEvent('Manual data updated');
    }

    updateWeatherDisplay() {
        document.getElementById('temperature').textContent = `${this.weatherData.temperature.toFixed(1)}°C`;
        document.getElementById('humidity').textContent = `${this.weatherData.humidity.toFixed(1)}%`;
        document.getElementById('pressure').textContent = `${this.weatherData.pressure.toFixed(1)} hPa`;
        document.getElementById('wind').textContent = `${this.weatherData.windSpeed.toFixed(1)} km/h`;
        document.getElementById('description').textContent = this.weatherData.description;
    }

    addMobileDevices() {
        const devices = ['Weather Display', 'Push Notifications', 'Quick Controls'];
        devices.forEach(device => this.addObserver(`Mobile: ${device}`));
        this.logEvent('Mobile factory created 3 devices');
    }

    addWebComponents() {
        const components = ['Dashboard', 'Alert Panel', 'Settings Panel'];
        components.forEach(component => this.addObserver(`Website: ${component}`));
        this.logEvent('Web factory created 3 components');
    }

    addSmartHome() {
        const devices = ['Wall Display', 'Voice Assistant', 'Climate Control'];
        devices.forEach(device => this.addObserver(`SmartHome: ${device}`));
        this.logEvent('SmartHome factory created 3 devices');
    }

    addObserver(name) {
        this.observers.push(name);
        this.updateObserversList();
    }

    updateObserversList() {
        const list = document.getElementById('observers-list');
        list.innerHTML = this.observers.map(observer =>
            `<div class="observer-item active">${observer}</div>`
        ).join('');
    }

    notifyObservers() {
        const notificationType = document.getElementById('notification-type').value;
        const senderType = document.getElementById('sender-type').value;

        this.observers.forEach(observer => {
            let message = '';

            if (notificationType === 'urgent') {
                message = `URGENT ${senderType.toUpperCase()}: ${observer} - ${this.weatherData.temperature.toFixed(1)}°C`;
            } else {
                message = `SCHEDULED ${senderType.toUpperCase()}: ${observer} - ${this.weatherData.description}`;
            }

            this.addNotification(message, notificationType);
        });

        this.logEvent(`Notified ${this.observers.length} observers`);
    }

    updateBridgeConfig() {
        const notificationType = document.getElementById('notification-type').value;
        const senderType = document.getElementById('sender-type').value;
        this.logEvent(`Bridge config: ${notificationType} + ${senderType}`);
    }

    addNotification(message, type) {
        const notification = {
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 10) this.notifications.pop();

        this.updateNotificationsDisplay();
    }

    updateNotificationsDisplay() {
        const container = document.getElementById('notifications');
        container.innerHTML = this.notifications.map(notif =>
            `<div class="notification-item ${notif.type === 'urgent' ? 'urgent' : ''}">
                [${notif.timestamp}] ${notif.message}
            </div>`
        ).join('');
    }

    logEvent(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.eventLog.unshift(`[${timestamp}] ${message}`);
        if (this.eventLog.length > 20) this.eventLog.pop();

        this.updateEventLog();
    }

    updateEventLog() {
        const container = document.getElementById('event-log');
        container.innerHTML = this.eventLog.map(entry =>
            `<div class="log-entry">${entry}</div>`
        ).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherSimulator();
});