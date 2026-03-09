import Constants from "expo-constants";
import appConfig from "../app.json";

class ApiConfig {
  private static _baseUrl: string | null = null;
  private static _cookieExpiration: number | null = null;

  static get baseUrl(): string {
    if (this._baseUrl === null) {
      this._baseUrl =
        Constants.expoConfig?.extra?.apiBaseUrl ||
        appConfig?.expo?.apiBaseUrl ||
        "http://localhost:5249/api";
    }
    return this._baseUrl;
  }

  static get cookieExpirationMinutes(): number {
    if (this._cookieExpiration === null) {
      this._cookieExpiration =
        Constants.expoConfig?.extra?.cookieExpirationMinutes ||
        appConfig?.expo?.cookieExpirationMinutes ||
        60;
    }
    return this._cookieExpiration;
  }

  // Force refresh config (useful for development)
  static refresh(): void {
    this._baseUrl = null;
    this._cookieExpiration = null;
  }
}

export default ApiConfig;
