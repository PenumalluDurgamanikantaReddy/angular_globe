import { Injectable } from '@angular/core';

// IMPORTANT: Do NOT commit API keys to source control. Provide the API key via
// an environment variable or by setting `window.__GOOGLE_MAPS_API_KEY` at runtime.
const GOOGLE_MAPS_API_KEY = (window as any).__GOOGLE_MAPS_API_KEY || '';

export type Maps = typeof google.maps;

@Injectable({ providedIn: 'root' })
export class ApiService {
  public readonly api = this.load();

  private load(): Promise<Maps> {
    // If no API key provided, reject so callers can fallback
    if (!GOOGLE_MAPS_API_KEY) {
      return Promise.reject(new Error('No Google Maps API key configured'));
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    const callbackName = `GooglePlaces_cb_` + ((Math.random() * 1e9) >>> 0);
    script.src = this.getScriptSrc(callbackName);

    interface MyWindow { [name: string]: Function; };
    const myWindow: MyWindow = window as any;

    const promise = new Promise<Maps>((resolve, reject) => {
      myWindow[callbackName] = () => resolve(google.maps as Maps);
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    });
    document.body.appendChild(script);
    return promise;
  }

  private getScriptSrc(callback: string): string {
    const query: { [key: string]: string } = {
      v: '3',
      callback,
      key: GOOGLE_MAPS_API_KEY,
      libraries: 'places',
    };
    const params = Object.keys(query).map(key => `${key}=${encodeURIComponent(query[key])}`).join('&');
    // Add loading=async to avoid Google's deprecation warning about sync loading
    return `https://maps.googleapis.com/maps/api/js?${params}&loading=async`;
  }
}
