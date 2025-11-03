class RealWeatherService {
    constructor() {
        this.apiKey = '2060f95a3a37ed4383b1d276a26fdad1';
        this.cities = {
            almaty: { lat: 43.2565, lon: 76.9285, name: 'Almaty' },
            astana: { lat: 51.1694, lon: 71.4491, name: 'Astana' },
            shymkent: { lat: 42.3417, lon: 69.5901, name: 'Shymkent' },
            aktobe: { lat: 50.2833, lon: 57.1667, name: 'Aktobe' },
            karaganda: { lat: 49.8019, lon: 73.1021, name: 'Karaganda' },
            aktau: { lat: 43.6416, lon: 51.1717, name: 'Aktau' }
        };
    }
    async getRealWeather(city) {
        const coords = this.cities[city];
        if (!coords) return null;
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`
            );
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            return this.formatWeatherData(data, coords.name);
        } catch (error) {
            console.error('Error fetching weather:', error);
            return this.getFallbackData(city);
        }
    }
    async getHourlyForecast(city) {
        const coords = this.cities[city];
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric`
            );
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            return this.formatHourlyData(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return this.generateRealisticForecast(city);
        }
    }
    formatWeatherData(apiData, cityName) {
        const weatherDescription = apiData.weather[0].description;
        const englishDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);

        return {
            temperature: apiData.main.temp,
            humidity: apiData.main.humidity,
            pressure: apiData.main.pressure,
            windSpeed: apiData.wind.speed * 3.6,
            description: this.getWeatherEmoji(apiData.weather[0].id) + " " + englishDescription,
            city: cityName
        };
    }
    formatHourlyData(apiData) {
        return apiData.list.slice(0, 8).map(item => ({
            time: new Date(item.dt * 1000).getHours() + ':00',
            temperature: item.main.temp,
            windSpeed: item.wind.speed * 3.6,
            description: this.getWeatherEmoji(item.weather[0].id),
            humidity: item.main.humidity
        }));
    }
    getWeatherEmoji(weatherId) {
        if (weatherId >= 200 && weatherId < 300) return '⛈️';
        if (weatherId >= 300 && weatherId < 400) return '🌧️';
        if (weatherId >= 500 && weatherId < 600) return '🌧️';
        if (weatherId >= 600 && weatherId < 700) return '❄️';
        if (weatherId >= 700 && weatherId < 800) return '🌫️';
        if (weatherId === 800) return '☀️';
        if (weatherId === 801) return '🌤️';
        if (weatherId === 802) return '⛅';
        if (weatherId > 802) return '☁️';
        return '🌤️';
    }
    getFallbackData(city) {
        const fallbackData = {
            almaty: { temp: -2.5, humidity: 75, pressure: 1020, wind: 3.2, desc: "❄️ Snow" },
            astana: { temp: 0.8, humidity: 80, pressure: 1018, wind: 4.5, desc: "❄️ Light snow" },
            shymkent: { temp: 5.2, humidity: 65, pressure: 1015, wind: 2.8, desc: "☁️ Cloudy" },
            aktobe: { temp: -1.3, humidity: 78, pressure: 1017, wind: 5.1, desc: "🌨️ Snowfall" },
            karaganda: { temp: -3.7, humidity: 82, pressure: 1019, wind: 6.2, desc: "❄️ Snow" },
            aktau: { temp: 8.5, humidity: 70, pressure: 1014, wind: 7.8, desc: "💨 Windy" }
        };
        return fallbackData[city];
    }
    generateRealisticForecast(city) {
        const baseData = this.getFallbackData(city);
        const hours = [];
        const currentHour = new Date().getHours();
        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const tempVariation = Math.sin((hour - 12) * Math.PI / 12) * 2;
            hours.push({
                time: (hour) + ':00',
                temperature: baseData.temp + tempVariation,
                windSpeed: baseData.wind + Math.random() * 3,
                description: this.getRealisticDescription(baseData.temp + tempVariation, hour),
                humidity: baseData.humidity + Math.random() * 10 - 5
            });
        }
        return hours;
    }
    getRealisticDescription(temp, hour) {
        const isDay = hour >= 6 && hour <= 20;
        if (temp > 30) return isDay ? "🔥" : "🔥";
        if (temp > 25) return isDay ? "☀️" : "🌙";
        if (temp > 20) return isDay ? "🌤️" : "🌙";
        if (temp > 15) return isDay ? "⛅" : "☁️";
        if (temp > 10) return isDay ? "🌥️" : "☁️";
        if (temp > 5) return isDay ? "🌧️" : "🌧️";
        if (temp > 0) return isDay ? "❄️" : "❄️";
        return "🧊";
    }
}
class LiveWeatherEngine {
    constructor(weatherService) {
        this.weatherService = weatherService;
        this.updateInterval = 60000; // 1 минута
        this.weatherHistory = [];
        this.isLiveMode = false;
        this.liveInterval = null;
        this.updateCount = 0;
        this.currentCity = null;
    }
    startLiveUpdates(city) {
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
        }
        this.isLiveMode = true;
        this.updateCount = 0;
        this.currentCity = city;

        this.performLiveUpdate();
        this.liveInterval = setInterval(() => {
            this.performLiveUpdate();
        }, this.updateInterval);

        return this.isLiveMode;
    }
    stopLiveUpdates() {
        this.isLiveMode = false;
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
            this.liveInterval = null;
        }
        return this.isLiveMode;
    }
    async performLiveUpdate() {
        if (!this.currentCity) return null;
        try {
            const currentWeather = await this.weatherService.getRealWeather(this.currentCity);
            if (currentWeather) {
                this.addToHistory(currentWeather);
                this.updateCount++;
                return currentWeather;
            }
        } catch (error) {
            console.error('Live update failed:', error);
        }
        return null;
    }
    addToHistory(weatherData) {
        const timestamp = new Date();
        const historyItem = {
            ...weatherData,
            timestamp: timestamp,
            timeString: timestamp.toLocaleTimeString()
        };
        this.weatherHistory.unshift(historyItem);
        if (this.weatherHistory.length > 5) {
            this.weatherHistory.pop();
        }
    }
    calculateTrends() {
        if (this.weatherHistory.length < 2) {
            return {
                temperature: { trend: 'stable', value: 0, direction: '→', unit: '°C/min' },
                humidity: { trend: 'stable', value: 0, direction: '→', unit: '%/min' },
                pressure: { trend: 'stable', value: 0, direction: '→', unit: 'hPa/min' },
                windSpeed: { trend: 'stable', value: 0, direction: '→', unit: 'km/h/min' }
            };
        }
        const current = this.weatherHistory[0];
        const previous = this.weatherHistory[1];

        const timeDiff = (current.timestamp - previous.timestamp) / (1000 * 60); // разница в минутах
        if (timeDiff === 0) return this.calculateTrends();

        return {
            temperature: this.calculateTrend(current.temperature, previous.temperature, timeDiff, '°C/min'),
            humidity: this.calculateTrend(current.humidity, previous.humidity, timeDiff, '%/min'),
            pressure: this.calculateTrend(current.pressure, previous.pressure, timeDiff, 'hPa/min'),
            windSpeed: this.calculateTrend(current.windSpeed, previous.windSpeed, timeDiff, 'km/h/min')
        };
    }
    calculateTrend(current, previous, timeDiff, unit) {
        const change = current - previous;
        const changePerMinute = change / timeDiff;

        let direction = '→';
        let trend = 'stable';

        if (Math.abs(changePerMinute) > 0.05) {
            if (changePerMinute > 0) {
                direction = '↑';
                trend = 'rising';
            } else {
                direction = '↓';
                trend = 'falling';
            }
        }
        return {
            trend,
            value: Math.abs(changePerMinute.toFixed(2)),
            direction,
            unit,
            change
        };
    }
    getTimeUntilNextUpdate() {
        if (!this.liveInterval || !this.weatherHistory[0]) return 60;

        const lastUpdate = this.weatherHistory[0].timestamp;
        const nextUpdate = new Date(lastUpdate.getTime() + this.updateInterval);
        const now = new Date();

        return Math.max(0, Math.floor((nextUpdate - now) / 1000));
    }
    getUpdateStatus() {
        if (!this.isLiveMode) {
            return { mode: 'off', text: 'Live updates off' };
        }

        const timeLeft = this.getTimeUntilNextUpdate();
        const trends = this.calculateTrends();

        return {
            mode: 'live',
            text: `LIVE • Next update in ${timeLeft}s`,
            updateCount: this.updateCount,
            timeLeft,
            trends,
            lastUpdate: this.weatherHistory[0] ? this.weatherHistory[0].timeString : 'Never'
        };
    }
}
class WeatherSimulator {
    constructor() {
        this.observers = [];
        this.currentStrategy = 'realtime';
        this.currentCity = 'almaty'
        this.bridgeConfig = {
            notificationType: 'scheduled',
            senderType: 'push'
        };
        this.weatherData = {
            temperature: 20,
            humidity: 65,
            pressure: 1013,
            windSpeed: 5,
            description: 'Loading...'
        };
        this.eventLog = [];
        this.notifications = [];
        this.currentCarouselIndex = 0;
        this.hoursPerView = 5;
        this.hourlyData = [];
        this.currentCity = 'almaty';

        this.weatherService = new RealWeatherService();
        this.liveEngine = new LiveWeatherEngine(this.weatherService);

        this.initializeEventListeners();
        this.loadInitialWeather();
        setTimeout(() => this.switchCity('almaty'), 100);

        this.startStatusUpdates();
    }

    startStatusUpdates() {
        setInterval(() => {
            this.updateLiveIndicators();
        }, 1000);
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

        document.getElementById('mobile-factory').addEventListener('click', () => this.addMobileDevice());
        document.getElementById('web-factory').addEventListener('click', () => this.addWebDevice());
        document.getElementById('smarthome-factory').addEventListener('click', () => this.addSmartHome());

        document.getElementById('update-manual').addEventListener('click', () => this.updateManualData());

        document.getElementById('notification-type').addEventListener('change', () => this.updateBridgeConfig());
        document.getElementById('sender-type').addEventListener('change', () => this.updateBridgeConfig());

        document.getElementById('send-notifications').addEventListener('click', () => this.notifyObservers());

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
        this.liveEngine.startLiveUpdates(this.currentCity);
        this.setStrategy('realtime');
        try {
            const currentWeather = await this.liveEngine.performLiveUpdate();
            if (currentWeather) {
                this.weatherData = {
                    temperature: currentWeather.temperature,
                    humidity: currentWeather.humidity,
                    pressure: currentWeather.pressure,
                    windSpeed: currentWeather.windSpeed,
                    description: currentWeather.description
                };
                this.updateWeatherDisplay();
                this.logEvent('🔄 Live updates started - refreshing every 60 seconds');
            }
        } catch (error) {
            this.logEvent('🔄 Live updates started (using fallback data)');
        }
    }
    async setScheduledStrategy() {
        const currentCity = this.currentCity;
        try {
            const response = await fetch(`/api/weather/strategy/scheduled?city=${currentCity}`, {
                method: 'POST'
            });
            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent(`⏰ Scheduled forecast loaded for ${currentCity}`);
        } catch (error) {
            this.generateScheduledData();
            this.updateWeatherDisplay();
            this.setStrategy('scheduled');
            this.logEvent(`⏰ Scheduled forecast generated for ${currentCity}`);
        }
    }
    setManualStrategy() {
        this.setStrategy('manual');
        this.showManualInput();
    }
    setStrategy(strategy) {
        this.currentStrategy = strategy;
        document.querySelectorAll('.strategy-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${strategy}-btn`).classList.add('active');

        if (strategy === 'realtime') {
            this.logEvent('🎯 Real-time strategy: LIVE UPDATES ENABLED');
        } else {
            this.liveEngine.stopLiveUpdates();
            if (strategy === 'manual') {
                this.showManualInput();
                this.logEvent('🎯 Manual strategy: enter custom data');
            } else {
                this.hideManualInput();
                this.logEvent('🎯 Scheduled strategy: fixed forecast');
            }
        }
    }
    updateLiveIndicators() {
        const status = this.liveEngine.getUpdateStatus();
        const trends = status.trends;

        const tempElement = document.getElementById('temperature');
        const humidityElement = document.getElementById('humidity');
        const pressureElement = document.getElementById('pressure');
        const windElement = document.getElementById('wind');
        const descElement = document.getElementById('description');

        if (this.currentStrategy === 'realtime' && this.liveEngine.isLiveMode) {
            tempElement.innerHTML = `${this.weatherData.temperature.toFixed(1)}°C 
            <span style="color: ${trends.temperature.direction === '↑' ? '#4CAF50' : trends.temperature.direction === '↓' ? '#f44336' : '#75b4e3'}; 
            font-size: 0.8em;">${trends.temperature.direction}</span>`;

            humidityElement.innerHTML = `${this.weatherData.humidity.toFixed(1)}% 
            <span style="color: ${trends.humidity.direction === '↑' ? '#f44336' : trends.humidity.direction === '↓' ? '#4CAF50' : '#75b4e3'}; 
            font-size: 0.8em;">${trends.humidity.direction}</span>`;

            windElement.innerHTML = `${this.weatherData.windSpeed.toFixed(1)} km/h 
            <span style="color: ${trends.windSpeed.direction === '↑' ? '#f44336' : trends.windSpeed.direction === '↓' ? '#4CAF50' : '#75b4e3'}; 
            font-size: 0.8em;">${trends.windSpeed.direction}</span>`;

            descElement.innerHTML = `${this.weatherData.description} 
            <span style="font-size:0.7em; color:#75b4e3; animation: pulse 2s infinite;">• ${status.text}</span>`;
        } else {
            tempElement.textContent = `${this.weatherData.temperature.toFixed(1)}°C`;
            humidityElement.textContent = `${this.weatherData.humidity.toFixed(1)}%`;
            windElement.textContent = `${this.weatherData.windSpeed.toFixed(1)} km/h`;
            descElement.textContent = this.weatherData.description;
        }
    }
    showManualInput() {
        document.getElementById('manual-input-section').style.display = 'block';
    }
    hideManualInput() {
        document.getElementById('manual-input-section').style.display = 'none';
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

        const weatherIcon = document.querySelector('.weather-icon');
        const temp = this.weatherData.temperature;
        if (temp > 28) weatherIcon.textContent = '🔥';
        else if (temp > 22) weatherIcon.textContent = '☀️';
        else if (temp > 15) weatherIcon.textContent = '⛅';
        else if (temp > 5) weatherIcon.textContent = '🌧️';
        else weatherIcon.textContent = '❄️';

        this.updateLiveIndicators();
    }
    async switchCity(city) {
        this.currentCity = city;
        this.logEvent(`🏙️ Loading real weather for ${city}...`);

        if (this.liveEngine.isLiveMode) {
            this.liveEngine.startLiveUpdates(city);
        }
        try {
            const currentWeather = await this.weatherService.getRealWeather(city);
            const hourlyForecast = await this.weatherService.getHourlyForecast(city);

            if (currentWeather) {
                this.weatherData = {
                    temperature: currentWeather.temperature,
                    humidity: currentWeather.humidity,
                    pressure: currentWeather.pressure,
                    windSpeed: currentWeather.windSpeed,
                    description: currentWeather.description
                };

                this.hourlyData = hourlyForecast;
                this.updateWeatherDisplay();
                this.updateCarousel();
                this.logEvent(`✅ Real weather for ${currentWeather.city}: ${currentWeather.temperature.toFixed(1)}°C`);
            }
        } catch (error) {
            console.error('Error loading city data:', error);
            this.useRealisticCityData(city);
            this.logEvent(`⚠️ Using realistic data for ${city}`);
        }
    }
    useRealisticCityData(city) {
        const realisticData = this.weatherService.getFallbackData(city);
        this.weatherData = {
            temperature: realisticData.temp,
            humidity: realisticData.humidity,
            pressure: realisticData.pressure,
            windSpeed: realisticData.wind,
            description: realisticData.desc
        };
        this.hourlyData = this.weatherService.generateRealisticForecast(city);
        this.updateWeatherDisplay();
        this.updateCarousel();
    }
    addMobileDevice() {
        this.addObserver("📱 Mobile Device");
        this.logEvent('✅ Mobile Device added via MobileFactory');
    }
    addWebDevice() {
        this.addObserver("🖥️ Web Device");
        this.logEvent('✅ Web Device added via WebFactory');
    }
    addSmartHome() {
        this.addObserver("🏠 Smart Home");
        this.logEvent('✅ Smart Home added via SmartHomeFactory');
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

    updateCarousel() {
        const track = document.querySelector('.carousel-track');
        if (!track) return;

        track.innerHTML = this.hourlyData.map(hour => `
            <div class="weather-hour-card">
                <div class="hour-time">${hour.time}</div>
                <div class="hour-temp">${hour.temperature.toFixed(1)}°C</div>
                <div class="hour-wind">💨 ${hour.windSpeed.toFixed(1)} km/h</div>
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
            const cardWidth = 92;
            track.style.transform = `translateX(-${this.currentCarouselIndex * cardWidth}px)`;
        }
    }

    updateCarouselButtons() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const maxIndex = Math.max(0, this.hourlyData.length - this.hoursPerView);

        if (prevBtn) {
            prevBtn.disabled = this.currentCarouselIndex === 0;
            prevBtn.style.opacity = this.currentCarouselIndex === 0 ? '0.3' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentCarouselIndex >= maxIndex;
            nextBtn.style.opacity = this.currentCarouselIndex >= maxIndex ? '0.3' : '1';
        }
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
            this.weatherData = {
                temperature: temp,
                humidity,
                pressure,
                windSpeed,
                description: "Manual Data"
            };
            this.updateWeatherDisplay();
            this.logEvent(`✅ Manual data applied locally: ${temp}°C, ${humidity}%`);
        }
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
}
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherSimulator();
});