import { Timestamp } from 'firebase-admin/firestore';

export interface WeatherInfo {
  temperature?: number;
  conditions?: string;
  windSpeed?: number;
  windDirection?: string;
  humidity?: number;
  visibility?: number;
  pressure?: number;
  fetchedAt?: Timestamp;
}

/**
 * Fetch weather conditions for a location using OpenWeatherMap API
 * Falls back gracefully if API key is not configured
 */
export async function fetchWeatherForLocation(
  lat: number,
  lng: number,
  address?: string
): Promise<WeatherInfo | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.log('[Weather] OPENWEATHER_API_KEY not configured, skipping weather fetch');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`;
    
    console.log(`[Weather] Fetching weather for ${address || `${lat},${lng}`}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`[Weather] API returned ${response.status}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Map OpenWeatherMap response to our schema
    const weatherInfo: WeatherInfo = {
      temperature: data.main?.temp ? Math.round(data.main.temp) : undefined,
      conditions: data.weather?.[0]?.description 
        ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
        : undefined,
      windSpeed: data.wind?.speed ? Math.round(data.wind.speed * 10) / 10 : undefined,
      windDirection: data.wind?.deg ? getWindDirection(data.wind.deg) : undefined,
      humidity: data.main?.humidity,
      visibility: data.visibility ? Math.round(data.visibility / 1609.34 * 10) / 10 : undefined, // Convert meters to miles
      pressure: data.main?.pressure,
      fetchedAt: Timestamp.now(),
    };
    
    console.log(`[Weather] Successfully fetched weather: ${weatherInfo.conditions || 'N/A'} ${weatherInfo.temperature || 'N/A'}°F`);
    
    return weatherInfo;
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error);
    return null;
  }
}

/**
 * Convert wind direction degrees to cardinal direction
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

