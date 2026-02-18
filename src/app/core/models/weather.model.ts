/**
 * Weather Model
 * Represents weather data from backend utility API
 */
export interface Weather {
  temperature: number;   // 22
  weather: string;       // Sunny
}


/**
 * Datetime Model
 * Structured datetime from backend
 * Clean enterprise contract
 */
export interface Datetime {
  day: string;   // Wednesday
  date: string;  // 18 Feb 2026
  time: string;  // 14:42
}
