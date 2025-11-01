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

        this.initializeEventListeners();
        this.loadInitialWeather();
    }

    async loadInitialWeather() {
        try {
            const response = await fetch('/api/weather/current');
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
        } catch (error) {
            console.log('Using default weather data');
        }
    }

    initializeEventListeners() {
        document.getElementById('realtime-btn').addEventListener('click', () => this.setRealTimeStrategy());
        document.getElementById('scheduled-btn').addEventListener('click', () => this.setScheduledStrategy());
        document.getElementById('manual-btn').addEventListener('click', () => this.setManualStrategy());

        document.getElementById('mobile-factory').addEventListener('click', () => this.addMobileDevices());
        document.getElementById('web-factory').addEventListener('click', () => this.addWebComponents());
        document.getElementById('smarthome-factory').addEventListener('click', () => this.addSmartHome());

        document.getElementById('update-manual').addEventListener('click', () => this.updateManualData());

        document.getElementById('notification-type').addEventListener('change', () => this.updateBridgeConfig());
        document.getElementById('sender-type').addEventListener('change', () => this.updateBridgeConfig());
    }

    async setRealTimeStrategy() {
        try {
            const response = await fetch('/api/weather/strategy/realtime', { method: 'POST' });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.setStrategy('realtime');
            this.logEvent('Real-time data loaded from server');
        } catch (error) {
            this.generateRealTimeData();
            this.updateWeatherDisplay();
            this.setStrategy('realtime');
            this.logEvent('Real-time data generated locally');
        }
    }

    async setScheduledStrategy() {
        try {
            const response = await fetch('/api/weather/strategy/scheduled', { method: 'POST' });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent('Scheduled forecast loaded from server');
        } catch (error) {
            this.generateScheduledData();
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent('Scheduled forecast generated locally');
        }
    }

    setManualStrategy() {
        this.setStrategy('manual');
        this.showManualInput();
    }

    async updateManualData() {
        const temp = parseFloat(document.getElementById('manual-temp').value);
        const humidity = parseFloat(document.getElementById('manual-humidity').value);
        const pressure = parseFloat(document.getElementById('manual-pressure').value);
        const windSpeed = parseFloat(document.getElementById('manual-wind').value);

        // Валидация данных
        const validation = this.validateManualData(temp, humidity, pressure, windSpeed);
        if (!validation.isValid) {
            this.logEvent(`❌ Invalid data: ${validation.message}`);
            alert(`❌ Invalid data: ${validation.message}\n\nPlease enter realistic values:\n• Temperature: -60 to 60°C\n• Humidity: 0 to 100%\n• Pressure: 870 to 1085 hPa\n• Wind: 0 to 150 km/h`);
            return;
        }

        try {
            const response = await fetch('/api/weather/strategy/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    temp: temp,
                    humidity: humidity,
                    pressure: pressure,
                    wind: windSpeed
                    // description больше не отправляем
                })
            });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.logEvent(`✅ Manual data applied: ${temp}°C, ${humidity}%`);
        } catch (error) {
            console.error('API error:', error);
            // Локальный fallback
            this.weatherData.temperature = temp;
            this.weatherData.humidity = humidity;
            this.weatherData.pressure = pressure;
            this.weatherData.windSpeed = windSpeed;
            this.weatherData.description = "Manual Data";
            this.updateWeatherDisplay();
            this.logEvent(`✅ Manual data applied locally: ${temp}°C, ${humidity}%`);
        }

        // Очищаем поля
        document.getElementById('manual-temp').value = '';
        document.getElementById('manual-humidity').value = '';
        document.getElementById('manual-pressure').value = '';
        document.getElementById('manual-wind').value = '';
    }

    validateManualData(temp, humidity, pressure, windSpeed) {
        // Проверка на пустые значения
        if (isNaN(temp) || isNaN(humidity) || isNaN(pressure) || isNaN(windSpeed)) {
            return { isValid: false, message: "All fields must be filled" };
        }

        // Проверка диапазонов
        if (temp < -60 || temp > 60) {
            return { isValid: false, message: "Temperature must be between -60°C and 60°C" };
        }

        if (humidity < 0 || humidity > 100) {
            return { isValid: false, message: "Humidity must be between 0% and 100%" };
        }

        if (pressure < 870 || pressure > 1085) {
            return { isValid: false, message: "Pressure must be between 870 hPa and 1085 hPa" };
        }

        if (windSpeed < 0 || windSpeed > 150) {
            return { isValid: false, message: "Wind speed must be between 0 km/h and 150 km/h" };
        }

        return { isValid: true, message: "Data is valid" };
    }

    setStrategy(strategy) {
        this.currentStrategy = strategy;
        document.querySelectorAll('.strategy-buttons .btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${strategy}-btn`).classList.add('active');
        this.logEvent(`Strategy: ${strategy}`);
    }

    showManualInput() {
        document.getElementById('manual-input-section').style.display = 'block';
    }

    hideManualInput() {
        document.getElementById('manual-input-section').style.display = 'none';
    }

    // ... остальные методы без изменений ...
    generateRealTimeData() {
        this.weatherData.temperature = 18 + (Math.random() * 15);
        this.weatherData.humidity = 50 + (Math.random() * 40);
        this.weatherData.pressure = 1005 + (Math.random() * 20);
        this.weatherData.windSpeed = 2 + (Math.random() * 18);
        this.weatherData.description = this.getWeatherDescription(this.weatherData.temperature);
    }

    generateScheduledData() {
        const forecasts = [
            { temp: 16, desc: "🌅 Morning: 16°C, Partly Cloudy" },
            { temp: 22, desc: "☀️ Noon: 22°C, Sunny" },
            { temp: 19, desc: "🌇 Evening: 19°C, Breezy" },
            { temp: 14, desc: "🌙 Night: 14°C, Clear" }
        ];
        const forecast = forecasts[Math.floor(Math.random() * forecasts.length)];
        this.weatherData.temperature = forecast.temp;
        this.weatherData.humidity = 65;
        this.weatherData.pressure = 1013;
        this.weatherData.windSpeed = 8;
        this.weatherData.description = forecast.desc;
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
        devices.forEach(device => this.addObserver(`📱 ${device}`));
        this.logEvent('Mobile Factory: Created 3 devices');
    }

    addWebComponents() {
        const components = ['Dashboard', 'Alert Panel', 'Settings Panel'];
        components.forEach(component => this.addObserver(`🖥️ ${component}`));
        this.logEvent('Web Factory: Created 3 components');
    }

    addSmartHome() {
        const devices = ['Wall Display', 'Voice Assistant', 'Climate Control'];
        devices.forEach(device => this.addObserver(`🏠 ${device}`));
        this.logEvent('SmartHome Factory: Created 3 devices');
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

            if (notificationType === 'urgent') {
                message = `🚨 URGENT ${senderType.toUpperCase()}: ${observer} - ${this.weatherData.description}`;
            } else {
                message = `⏰ ${senderType.toUpperCase()}: ${observer} - ${this.weatherData.description}`;
            }

            this.addNotification(message, notificationType);
        });

        this.logEvent(`Notified ${this.observers.length} observers`);
    }

    updateBridgeConfig() {
        const notificationType = document.getElementById('notification-type').value;
        const senderType = document.getElementById('sender-type').value;
        this.logEvent(`Bridge: ${notificationType} via ${senderType}`);
    }

    addNotification(message, type) {
        const notification = {
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 8) this.notifications.pop();

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
        if (this.eventLog.length > 12) this.eventLog.pop();

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