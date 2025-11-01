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
        this.updateCount = 0;

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
                this.logEvent('Manual mode activated - use inputs below');
                break;
        }
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.generateRealTimeData();
            this.updateWeatherDisplay();
            this.notifyObservers();
        }, 8000); // Увеличил с 3000 до 8000 мс (8 секунд)
    }

    startScheduledUpdates() {
        this.updateInterval = setInterval(() => {
            this.generateScheduledData();
            this.updateWeatherDisplay();
            this.notifyObservers();
        }, 15000); // Увеличил с 10000 до 15000 мс (15 секунд)
    }

    generateRealTimeData() {
        this.updateCount++;

        // Более плавные изменения температуры
        this.weatherData.temperature += (Math.random() - 0.5) * 1.5;
        this.weatherData.temperature = Math.max(-5, Math.min(35, this.weatherData.temperature));

        // Медленные изменения других параметров
        this.weatherData.humidity = 60 + Math.random() * 25;
        this.weatherData.pressure = 1005 + Math.random() * 20;
        this.weatherData.windSpeed = 2 + Math.random() * 12;
        this.weatherData.description = this.getWeatherDescription(this.weatherData.temperature);

        this.logEvent(`Real-time update #${this.updateCount}`);
    }

    generateScheduledData() {
        this.updateCount++;
        const temps = [18.0, 22.5, 25.0, 16.5, 20.0, 23.5];
        this.weatherData.temperature = temps[Math.floor(Math.random() * temps.length)];
        this.weatherData.humidity = 55 + Math.random() * 30;
        this.weatherData.pressure = 1010;
        this.weatherData.windSpeed = 8;
        this.weatherData.description = 'Scheduled Update';

        this.logEvent(`Scheduled update #${this.updateCount}`);
    }

    getWeatherDescription(temp) {
        if (temp > 28) return 'Hot ☀️';
        if (temp > 24) return 'Warm 🌤️';
        if (temp > 18) return 'Mild ⛅';
        if (temp > 12) return 'Cool 🌥️';
        if (temp > 5) return 'Chilly 🌧️';
        return 'Cold ❄️';
    }

    updateManualData() {
        const temp = parseFloat(document.getElementById('manual-temp').value) || this.weatherData.temperature;
        const humidity = parseFloat(document.getElementById('manual-humidity').value) || this.weatherData.humidity;

        this.weatherData.temperature = temp;
        this.weatherData.humidity = humidity;
        this.weatherData.pressure = 1013;
        this.weatherData.windSpeed = 5;
        this.weatherData.description = 'Manual Input';

        this.updateWeatherDisplay();
        this.notifyObservers();
        this.logEvent('Manual data updated');

        // Очищаем поля после обновления
        document.getElementById('manual-temp').value = '';
        document.getElementById('manual-humidity').value = '';
    }

    updateWeatherDisplay() {
        document.getElementById('temperature').textContent = `${this.weatherData.temperature.toFixed(1)}°C`;
        document.getElementById('humidity').textContent = `${this.weatherData.humidity.toFixed(1)}%`;
        document.getElementById('pressure').textContent = `${this.weatherData.pressure.toFixed(1)} hPa`;
        document.getElementById('wind').textContent = `${this.weatherData.windSpeed.toFixed(1)} km/h`;
        document.getElementById('description').textContent = this.weatherData.description;

        // Добавляем эмодзи к описанию
        const descElement = document.getElementById('description');
        descElement.innerHTML = this.weatherData.description;
    }

    addMobileDevices() {
        const devices = ['Weather Display', 'Push Notifications', 'Quick Controls'];
        devices.forEach(device => this.addObserver(`📱 ${device}`));
        this.logEvent('Mobile Factory: Created 3 mobile devices');
    }

    addWebComponents() {
        const components = ['Dashboard', 'Alert Panel', 'Settings Panel'];
        components.forEach(component => this.addObserver(`🖥️ ${component}`));
        this.logEvent('Web Factory: Created 3 web components');
    }

    addSmartHome() {
        const devices = ['Wall Display', 'Voice Assistant', 'Climate Control'];
        devices.forEach(device => this.addObserver(`🏠 ${device}`));
        this.logEvent('SmartHome Factory: Created 3 smart home devices');
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
        if (this.observers.length === 0) {
            this.logEvent('No observers to notify');
            return;
        }

        const notificationType = document.getElementById('notification-type').value;
        const senderType = document.getElementById('sender-type').value;

        this.observers.forEach(observer => {
            let message = '';
            let type = notificationType;

            if (notificationType === 'urgent') {
                message = `🚨 URGENT ${senderType.toUpperCase()}: ${observer} - Temp: ${this.weatherData.temperature.toFixed(1)}°C`;
            } else {
                message = `⏰ SCHEDULED ${senderType.toUpperCase()}: ${observer} - ${this.weatherData.description}`;
            }

            this.addNotification(message, type);
        });

        this.logEvent(`Notified ${this.observers.length} observers via ${senderType}`);
    }

    updateBridgeConfig() {
        const notificationType = document.getElementById('notification-type').value;
        const senderType = document.getElementById('sender-type').value;
        this.logEvent(`Bridge configured: ${notificationType} notification via ${senderType}`);
    }

    addNotification(message, type) {
        const notification = {
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 8) this.notifications.pop(); // Уменьшил лимит

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
        if (this.eventLog.length > 15) this.eventLog.pop(); // Уменьшил лимит

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