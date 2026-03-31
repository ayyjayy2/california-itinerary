import { Injectable, signal } from '@angular/core';

export interface DayWeather {
  high: number;
  low: number;
  code: number;
  precip: number;   // precipitation probability %
}

const WMO_EMOJI: Record<number, string> = {
  0: '☀️',
  1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌦️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '❄️', 75: '❄️', 77: '🌨️',
  80: '🌦️', 81: '🌧️', 82: '🌧️',
  85: '🌨️', 86: '❄️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

const WMO_DESC: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy',
  51: 'Drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

const BASE = 'https://api.open-meteo.com/v1/forecast';
const DAILY = 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_mean';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private weatherMap = signal<Record<string, DayWeather>>({});
  loading = signal(true);
  error = signal(false);

  getWeather(dateISO: string): DayWeather | undefined {
    return this.weatherMap()[dateISO];
  }

  emoji(code: number): string {
    return WMO_EMOJI[code] ?? '🌡️';
  }

  desc(code: number): string {
    return WMO_DESC[code] ?? 'Unknown';
  }

  async fetchAll(): Promise<void> {
    try {
      await Promise.all([
        this.fetchCity(37.7749, -122.4194, '2026-02-28', '2026-03-03'),
        this.fetchCity(34.0522, -118.2437, '2026-03-04', '2026-03-07'),
        this.fetchCity(32.7157, -117.1611, '2026-03-08', '2026-03-10'),
      ]);
    } catch (e) {
      console.warn('Weather fetch failed:', e);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchCity(lat: number, lng: number, start: string, end: string): Promise<void> {
    const url = `${BASE}?latitude=${lat}&longitude=${lng}&daily=${DAILY}&temperature_unit=fahrenheit&timezone=America/Los_Angeles&start_date=${start}&end_date=${end}`;
    const res = await fetch(url);
    const data = await res.json();

    const patch: Record<string, DayWeather> = {};
    (data.daily.time as string[]).forEach((date, i) => {
      patch[date] = {
        high: Math.round(data.daily.temperature_2m_max[i]),
        low: Math.round(data.daily.temperature_2m_min[i]),
        code: data.daily.weathercode[i],
        precip: Math.round(data.daily.precipitation_probability_mean?.[i] ?? 0),
      };
    });

    this.weatherMap.update(prev => ({ ...prev, ...patch }));
  }
}
