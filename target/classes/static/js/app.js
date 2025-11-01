class WeatherSimulator {
    constructor() {
        this.observers = [];
        this.currentStrategy = 'realtime';
        this.bridgeConfig = {
            notificationType: 'scheduled',
            senderType: 'push'
        };
        this.weatherData = {
            temperature: 20,
            humidity: 65,
            pressure: 1013,
            windSpeed: 5,
            description: 'Sunny'
        };
        this.eventLog = [];
        this.notifications = [];
        this.currentCarouselIndex = 0;
        this.hoursPerView = 5; // Показываем по 5 часов за раз
        this.hourlyData = [];

        this.initializeEventListeners();
        this.loadInitialWeather();
        // Автоматически выбираем первый город
        setTimeout(() => this.switchCity('almaty'), 100);
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
        // Стратегии
        document.getElementById('realtime-btn').addEventListener('click', () => this.setRealTimeStrategy());
        document.getElementById('scheduled-btn').addEventListener('click', () => this.setScheduledStrategy());
        document.getElementById('manual-btn').addEventListener('click', () => this.setManualStrategy());

        // Фабрики
        document.getElementById('mobile-factory').addEventListener('click', () => this.addMobileDevice());
        document.getElementById('web-factory').addEventListener('click', () => this.addWebDevice());
        document.getElementById('smarthome-factory').addEventListener('click', () => this.addSmartHome());

        // Ручной ввод
        document.getElementById('update-manual').addEventListener('click', () => this.updateManualData());

        // Bridge конфигурация
        document.getElementById('notification-type').addEventListener('change', () => this.updateBridgeConfig());
        document.getElementById('sender-type').addEventListener('change', () => this.updateBridgeConfig());

        // Уведомления
        document.getElementById('send-notifications').addEventListener('click', () => this.notifyObservers());

        // Города
        document.querySelectorAll('.city-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const city = e.target.dataset.city;
                this.switchCity(city);
                document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            if (this.currentCarouselIndex > 0) {
                this.currentCarouselIndex--;
                this.updateCarouselPosition();
                this.updateCarouselButtons();
            }
        });

        document.querySelector('.next-btn')?.addEventListener('click', () => {
            const maxIndex = Math.max(0, this.hourlyData.length - this.hoursPerView);
            if (this.currentCarouselIndex < maxIndex) {
                this.currentCarouselIndex++;
                this.updateCarouselPosition();
                this.updateCarouselButtons();
            }
        });
    }

    async setRealTimeStrategy() {
        try {
            const response = await fetch('/api/weather/strategy/realtime', { method: 'POST' });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.setStrategy('realtime');
            this.logEvent('🔄 Real-time data loaded from server');
        } catch (error) {
            this.generateRealTimeData();
            this.updateWeatherDisplay();
            this.setStrategy('realtime');
            this.logEvent('🔄 Real-time data generated locally');
        }
    }

    async setScheduledStrategy() {
        try {
            const response = await fetch('/api/weather/strategy/scheduled', { method: 'POST' });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent('⏰ Scheduled forecast loaded from server');
        } catch (error) {
            this.generateScheduledData();
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent('⏰ Scheduled forecast generated locally');
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

        const validation = this.validateManualData(temp, humidity, pressure, windSpeed);
        if (!validation.isValid) {
            this.logEvent(`❌ Invalid data: ${validation.message}`);
            alert(`❌ Invalid data: ${validation.message}`);
            return;
        }

        try {
            const response = await fetch('/api/weather/strategy/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp, humidity, pressure, wind: windSpeed })
            });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.logEvent(`✅ Manual data applied: ${temp}°C, ${humidity}%`);
        } catch (error) {
            this.weatherData = { temperature: temp, humidity, pressure, windSpeed, description: "Manual Data" };
            this.updateWeatherDisplay();
            this.logEvent(`✅ Manual data applied locally: ${temp}°C, ${humidity}%`);
        }

        // Очистка полей
        ['manual-temp', 'manual-humidity', 'manual-pressure', 'manual-wind'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    validateManualData(temp, humidity, pressure, windSpeed) {
        if ([temp, humidity, pressure, windSpeed].some(isNaN)) {
            return { isValid: false, message: "All fields must be filled" };
        }
        if (temp < -60 || temp > 60) return { isValid: false, message: "Temperature must be between -60°C and 60°C" };
        if (humidity < 0 || humidity > 100) return { isValid: false, message: "Humidity must be between 0% and 100%" };
        if (pressure < 870 || pressure > 1085) return { isValid: false, message: "Pressure must be between 870 hPa and 1085 hPa" };
        if (windSpeed < 0 || windSpeed > 150) return { isValid: false, message: "Wind speed must be between 0 km/h and 150 km/h" };
        return { isValid: true, message: "Data is valid" };
    }

    setStrategy(strategy) {
        this.currentStrategy = strategy;
        document.querySelectorAll('.strategy-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${strategy}-btn`).classList.add('active');
        this.logEvent(`🎯 Strategy: ${strategy}`);

        if (strategy === 'manual') {
            this.showManualInput();
        } else {
            this.hideManualInput();
        }
    }

    showManualInput() {
        document.getElementById('manual-input-section').style.display = 'block';
    }

    hideManualInput() {
        document.getElementById('manual-input-section').style.display = 'none';
    }

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

        // Обновляем иконку погоды
        const weatherIcon = document.querySelector('.weather-icon');
        const temp = this.weatherData.temperature;
        if (temp > 28) weatherIcon.textContent = '🔥';
        else if (temp > 22) weatherIcon.textContent = '☀️';
        else if (temp > 15) weatherIcon.textContent = '⛅';
        else if (temp > 5) weatherIcon.textContent = '🌧️';
        else weatherIcon.textContent = '❄️';
    }

    addMobileDevice() {
        this.addObserver("📱 Mobile Device");
        this.logEvent('✅ Mobile Device added');
    }

    addWebDevice() {
        this.addObserver("🖥️ Web Device");
        this.logEvent('✅ Web Device added');
    }

    addSmartHome() {
        this.addObserver("🏠 Smart Home");
        this.logEvent('✅ Smart Home added');
    }

    addObserver(name) {
        const observer = {
            id: Date.now() + Math.random(),
            name: name,
            notificationType: this.bridgeConfig.notificationType,
            senderType: this.bridgeConfig.senderType,
            timestamp: new Date().toLocaleTimeString()
        };

        this.observers.push(observer);
        this.updateObserversList();
        this.logEvent(`✅ ${name} added with ${this.bridgeConfig.notificationType} + ${this.bridgeConfig.senderType}`);
    }

    updateObserversList() {
        const list = document.getElementById('observers-list');
        if (this.observers.length === 0) {
            list.innerHTML = '<div class="empty-state">No observers yet</div>';
            return;
        }

        list.innerHTML = this.observers.map((observer, index) => `
            <div class="observer-item active">
                <strong>#${index + 1}. ${observer.name}</strong><br>
                <small>🔔 ${observer.notificationType} + ${observer.senderType}</small><br>
                <small>⏰ ${observer.timestamp}</small>
            </div>
        `).join('');
    }

    notifyObservers() {
        if (this.observers.length === 0) {
            this.logEvent('❌ No observers to notify');
            return;
        }

        this.logEvent(`📢 Sending notifications to ${this.observers.length} observers...`);

        this.observers.forEach(observer => {
            const notificationType = observer.notificationType || this.bridgeConfig.notificationType;
            const senderType = observer.senderType || this.bridgeConfig.senderType;

            let message = notificationType === 'urgent'
                ? `🚨 URGENT: ${this.weatherData.temperature.toFixed(1)}°C weather alert`
                : `⏰ Scheduled: ${this.weatherData.description}`;

            this.addNotification(message, notificationType, senderType, observer.name);
        });

        this.logEvent(`✅ Notifications sent to ${this.observers.length} observers`);
    }

    updateBridgeConfig() {
        this.bridgeConfig.notificationType = document.getElementById('notification-type').value;
        this.bridgeConfig.senderType = document.getElementById('sender-type').value;
        this.logEvent(`🌉 Bridge configured: ${this.bridgeConfig.notificationType} + ${this.bridgeConfig.senderType}`);
    }

    addNotification(message, type, senderType, deviceName) {
        const notification = {
            message,
            type: type || 'scheduled',
            senderType: senderType || 'push',
            deviceName: deviceName || 'Unknown Device',
            timestamp: new Date().toLocaleTimeString()
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 8) this.notifications.pop();
        this.updateNotificationsDisplay();
    }

    updateNotificationsDisplay() {
        const container = document.getElementById('notifications');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = '<div class="empty-state">No notifications yet</div>';
            return;
        }

        container.innerHTML = this.notifications.map(notif => `
            <div class="notification-item ${notif.type === 'urgent' ? 'urgent' : ''}">
                <strong>${notif.deviceName}</strong><br>
                <small>${notif.message}</small><br>
                <small>via ${notif.senderType} • ${notif.timestamp}</small>
            </div>
        `).join('');
    }

    logEvent(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.eventLog.unshift(`[${timestamp}] ${message}`);
        if (this.eventLog.length > 10) this.eventLog.pop();
        this.updateEventLog();
    }

    updateEventLog() {
        const container = document.getElementById('event-log');
        if (!container) return;

        if (this.eventLog.length === 0) {
            container.innerHTML = '<div class="empty-state">Event log will appear here</div>';
            return;
        }

        container.innerHTML = this.eventLog.map(entry =>
            `<div class="log-entry">${entry}</div>`
        ).join('');
    }

    getWeatherDescription(temp) {
        if (temp > 28) return "Hot and Sunny";
        if (temp > 24) return "Warm and Pleasant";
        if (temp > 18) return "Mild and Comfortable";
        if (temp > 12) return "Cool and Breezy";
        return "Chilly and Cloudy";
    }

    updateWeather(temperature, humidity, pressure, windSpeed, description) {
        this.weatherData = { temperature, humidity, pressure, windSpeed, description };
        this.updateWeatherDisplay();
        this.notifyObservers();
        this.logEvent(`🌤️ Weather updated: ${temperature}°C, ${windSpeed} km/h`);
    }

    switchCity(city) {
        const cityData = {
            almaty: {
                temp: 25, humidity: 65, pressure: 1010, wind: 15, desc: "Sunny in Almaty",
                hourly: this.generateHourlyData(18, 28, 5, 20)
            },
            astana: {
                temp: 18, humidity: 70, pressure: 1015, wind: 25, desc: "Windy in Astana",
                hourly: this.generateHourlyData(12, 20, 15, 30)
            },
            shymkent: {
                temp: 28, humidity: 55, pressure: 1008, wind: 10, desc: "Hot in Shymkent",
                hourly: this.generateHourlyData(22, 32, 3, 15)
            },
            aktobe: {
                temp: 20, humidity: 60, pressure: 1012, wind: 18, desc: "Clear in Aktobe",
                hourly: this.generateHourlyData(15, 23, 10, 25)
            },
            karaganda: {
                temp: 16, humidity: 75, pressure: 1018, wind: 12, desc: "Cloudy in Karaganda",
                hourly: this.generateHourlyData(12, 18, 8, 20)
            },
            aktau: {
                temp: 22, humidity: 65, pressure: 1011, wind: 20, desc: "Breezy in Aktau",
                hourly: this.generateHourlyData(18, 25, 15, 25)
            }
        };

        const data = cityData[city];
        if (data) {
            this.updateWeather(data.temp, data.humidity, data.pressure, data.wind, data.desc);
            this.hourlyData = data.hourly;
            this.updateCarousel();
            this.logEvent(`🏙️ Switched to ${city}`);

            document.querySelectorAll('.city-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.city === city) {
                    btn.classList.add('active');
                }
            });
        }
    }

    generateHourlyData(minTemp, maxTemp, minWind, maxWind) {
        const hours = [];
        for (let hour = 0; hour < 24; hour++) {
            const time = `${hour.toString().padStart(2, '0')}:00`;
            const tempVariation = Math.sin((hour - 6) * Math.PI / 12);
            const temp = minTemp + (maxTemp - minTemp) * Math.max(0, tempVariation);
            const wind = minWind + (maxWind - minWind) * Math.random();

            hours.push({
                time,
                temperature: Math.round(temp * 10) / 10,
                windSpeed: Math.round(wind * 10) / 10,
                description: this.getHourDescription(temp, hour)
            });
        }
        return hours;
    }

    getHourDescription(temp, hour) {
        if (hour >= 6 && hour <= 18) {
            return temp > 28 ? "☀️" : temp > 22 ? "🌤️" : "⛅";
        } else {
            return temp > 20 ? "🌙" : "🌌";
        }
    }

    updateCarousel() {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        track.innerHTML = this.hourlyData.map(hour => `
            <div class="weather-hour-card">
                <div class="hour-time">${hour.time}</div>
                <div class="hour-temp">${hour.temperature}°C</div>
                <div class="hour-wind">💨 ${hour.windSpeed} km/h</div>
                <div class="hour-desc">${hour.description}</div>
            </div>
        `).join('');

        this.currentCarouselIndex = 0;
        this.updateCarouselPosition();
        this.updateCarouselButtons();
    }

    updateCarouselPosition() {
        const track = document.querySelector('.carousel-track');
        if (track) {
            const cardWidth = 92; // 80px + 12px gap
            track.style.transform = `translateX(-${this.currentCarouselIndex * cardWidth}px)`;
        }
    }

    updateCarouselButtons() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const maxIndex = Math.max(0, this.hourlyData.length - this.hoursPerView);

        if (prevBtn) {
            prevBtn.disabled = this.currentCarouselIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentCarouselIndex >= maxIndex;
        }
    }

    setWeatherScenario(scenario) {
        const scenarios = {
            heatwave: { temp: 35, humidity: 40, pressure: 1005, wind: 5, desc: "Heat wave! 🔥" },
            storm: { temp: 15, humidity: 85, pressure: 980, wind: 35, desc: "Storm warning! ⚡" },
            perfect: { temp: 22, humidity: 55, pressure: 1013, wind: 8, desc: "Perfect weather! 🌤️" },
            cold: { temp: -5, humidity: 70, pressure: 1020, wind: 15, desc: "Freezing cold! ❄️" }
        };

        const scenarioData = scenarios[scenario];
        if (scenarioData) {
            this.updateWeather(scenarioData.temp, scenarioData.humidity, scenarioData.pressure, scenarioData.wind, scenarioData.desc);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherSimulator();
});