import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { Weather, Datetime } from '../models/weather.model';

/**
 * UtilityService
 * 
 * Handles utility API operations (weather, datetime, etc.)
 * Architecture Decision: Consolidates utility endpoints into single service.
 * 
 * Endpoints:
 * - GET /utils/weather - Get current weather
 * - GET /utils/datetime - Get current datetime
 */
@Injectable({ providedIn: 'root' })
export class UtilityService {
  private readonly endpoint = '/utils';

  /** WMO Weather interpretation codes mapping */
  private readonly weatherCodes: Record<number, string> = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Severe Thunderstorm'
  };

  constructor(private api: ApiBaseService) {}

  /**
   * Get current weather data
   * @returns Observable<Weather>
   */
  getWeather(): Observable<Weather> {
    return this.api.get<any>(`${this.endpoint}/weather`).pipe(
      map((response: any) => {
        // Direct format: { temperature: 22, weather: "Sunny" }
        if (response?.temperature !== undefined && response?.weather) {
          return response as Weather;
        }
        // Handle Open-Meteo API format with current_weather
        if (response?.current_weather) {
          const current = response.current_weather;
          const weatherCode = current.weathercode ?? current.weather_code ?? 0;
          return {
            temperature: Math.round(current.temperature),
            weather: this.weatherCodes[weatherCode] || 'Unknown'
          } as Weather;
        }
        // Fallback
        return { temperature: 24, weather: 'Sunny' } as Weather;
      })
    );
  }

  /**
   * Get current datetime
   * @returns Observable<Datetime>
   */
  getDatetime(): Observable<Datetime> {
    return this.api.get<any>(`${this.endpoint}/datetime`).pipe(
      map((response: any) => {
        // Direct format: { day: "Wednesday", date: "18 Feb 2026", time: "05:30" }
        if (response?.day && response?.date && response?.time) {
          return response as Datetime;
        }
        // Handle ISO datetime string: { datetime: "2026-02-18T04:45:20", timezone: "..." }
        if (response?.datetime) {
          const date = new Date(response.datetime);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
          } as Datetime;
        }
        // Fallback
        const now = new Date();
        return {
          day: now.toLocaleDateString('en-US', { weekday: 'long' }),
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
        } as Datetime;
      })
    );
  }
}
