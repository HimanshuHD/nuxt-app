export interface WeatherLocation {
  name: string
  country: string
  state?: string
  latitude: number
  longitude: number
}

export interface CurrentWeather {
  location: WeatherLocation
  temperature: number
  feelsLike: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  cloudiness: number
  sunrise: string
  sunset: string
  timezoneOffset: number
}
