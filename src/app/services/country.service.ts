import { Injectable } from '@angular/core';
import { countries } from 'countries-list';

export interface Country {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  capital?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countryData: Country[] = [];

  constructor() {
    this.initializeCountries();
  }

  private initializeCountries(): void {
    // Convert countries-list data to our format with coordinates
    const countryCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'US': { lat: 37.0902, lng: -95.7129 },
      'GB': { lat: 55.3781, lng: -3.4360 },
      'FR': { lat: 46.2276, lng: 2.2137 },
      'DE': { lat: 51.1657, lng: 10.4515 },
      'IT': { lat: 41.8719, lng: 12.5674 },
      'ES': { lat: 40.4637, lng: -3.7492 },
      'CA': { lat: 56.1304, lng: -106.3468 },
      'AU': { lat: -25.2744, lng: 133.7751 },
      'JP': { lat: 36.2048, lng: 138.2529 },
      'CN': { lat: 35.8617, lng: 104.1954 },
      'IN': { lat: 20.5937, lng: 78.9629 },
      'BR': { lat: -14.2350, lng: -51.9253 },
      'RU': { lat: 61.5240, lng: 105.3188 },
      'MX': { lat: 23.6345, lng: -102.5528 },
      'ZA': { lat: -30.5595, lng: 22.9375 },
      'EG': { lat: 26.8206, lng: 30.8025 },
      'NG': { lat: 9.0820, lng: 8.6753 },
      'KE': { lat: -0.0236, lng: 37.9062 },
      'AR': { lat: -38.4161, lng: -63.6167 },
      'CL': { lat: -35.6751, lng: -71.5430 },
      'PE': { lat: -9.1900, lng: -75.0152 },
      'CO': { lat: 4.5709, lng: -74.2973 },
      'VE': { lat: 6.4238, lng: -66.5897 },
      'TH': { lat: 15.8700, lng: 100.9925 },
      'VN': { lat: 14.0583, lng: 108.2772 },
      'PH': { lat: 12.8797, lng: 121.7740 },
      'ID': { lat: -0.7893, lng: 113.9213 },
      'MY': { lat: 4.2105, lng: 101.9758 },
      'SG': { lat: 1.3521, lng: 103.8198 },
      'NZ': { lat: -40.9006, lng: 174.8860 },
      'NO': { lat: 60.4720, lng: 8.4689 },
      'SE': { lat: 60.1282, lng: 18.6435 },
      'FI': { lat: 61.9241, lng: 25.7482 },
      'DK': { lat: 56.2639, lng: 9.5018 },
      'NL': { lat: 52.1326, lng: 5.2913 },
      'BE': { lat: 50.5039, lng: 4.4699 },
      'CH': { lat: 46.8182, lng: 8.2275 },
      'AT': { lat: 47.5162, lng: 14.5501 },
      'PL': { lat: 51.9194, lng: 19.1451 },
      'CZ': { lat: 49.8175, lng: 15.4730 },
      'GR': { lat: 39.0742, lng: 21.8243 },
      'PT': { lat: 39.3999, lng: -8.2245 },
      'TR': { lat: 38.9637, lng: 35.2433 },
      'SA': { lat: 23.8859, lng: 45.0792 },
      'AE': { lat: 23.4241, lng: 53.8478 },
      'IL': { lat: 31.0461, lng: 34.8516 },
      'KR': { lat: 35.9078, lng: 127.7669 },
      'TW': { lat: 23.6978, lng: 120.9605 },
      'HK': { lat: 22.3193, lng: 114.1694 },
      'IE': { lat: 53.4129, lng: -8.2439 },
      'IS': { lat: 64.9631, lng: -19.0208 },
      'UA': { lat: 48.3794, lng: 31.1656 },
      'RO': { lat: 45.9432, lng: 24.9668 },
      'HU': { lat: 47.1625, lng: 19.5033 },
      'BG': { lat: 42.7339, lng: 25.4858 },
      'HR': { lat: 45.1, lng: 15.2 },
      'RS': { lat: 44.0165, lng: 21.0059 },
      'SK': { lat: 48.6690, lng: 19.6990 },
      'SI': { lat: 46.1512, lng: 14.9955 },
      'LT': { lat: 55.1694, lng: 23.8813 },
      'LV': { lat: 56.8796, lng: 24.6032 },
      'EE': { lat: 58.5953, lng: 25.0136 },
      'BY': { lat: 53.7098, lng: 27.9534 },
      'IM': { lat: 54.2361, lng: -4.5481 },
      'GI': { lat: 36.1408, lng: -5.3536 },
      'VA': { lat: 41.9029, lng: 12.4534 },
      'SM': { lat: 43.9424, lng: 12.4578 },
      'MC': { lat: 43.7384, lng: 7.4246 },
      'LI': { lat: 47.1660, lng: 9.5554 },
      'AD': { lat: 42.5063, lng: 1.5218 }
    };

    Object.entries(countries).forEach(([code, country]) => {
      const coords = countryCoordinates[code];
      if (coords) {
        this.countryData.push({
          name: country.name,
          code: code,
          latitude: coords.lat,
          longitude: coords.lng,
          capital: country.capital
        });
      }
    });
  }

  searchCountries(query: string): Country[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    return this.countryData
      .filter(country => 
        country.name.toLowerCase().includes(searchTerm) ||
        country.code.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize matches at the start of the name
        const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
        const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10); // Limit to 10 suggestions
  }

  getCountryByCode(code: string): Country | undefined {
    return this.countryData.find(c => c.code === code);
  }

  /**
   * Find nearest country from given coordinates (latitude, longitude).
   * Returns the nearest Country object.
   */
  getNearestCountry(latitude: number, longitude: number): Country | undefined {
    if (this.countryData.length === 0) return undefined;

    let nearest: Country | undefined = undefined;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const c of this.countryData) {
      const d = this.haversineDistance(latitude, longitude, c.latitude, c.longitude);
      if (d < bestDist) {
        bestDist = d;
        nearest = c;
      }
    }
    return nearest;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getAllCountries(): Country[] {
    return [...this.countryData];
  }
}
