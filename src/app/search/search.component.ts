import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService, Country } from '../services/country.service';
import { ApiService, Maps } from '../services/api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @Output() countrySelected = new EventEmitter<Country>();
  
  searchQuery: string = '';
  suggestions: Country[] = [];
  // place predictions from Google Places API
  placeSuggestions: any[] = [];
  showSuggestions: boolean = false;
  selectedIndex: number = -1;
  private maps?: Maps;
  private autocompleteService?: any;
  private placesService?: any;

  constructor(private countryService: CountryService, private apiService: ApiService, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.apiService.api
      .then((maps: Maps) => this.initAutocomplete(maps))
      .catch(() => {
        // Google Maps not available — keep local country search fallback
        // no-op
      });
  }

  private initAutocomplete(maps: Maps): void {
    this.maps = maps;
    if (!this.searchInput) return;
    // Use AutocompleteService to fetch predictions so we can render them with our styles
    try {
      this.autocompleteService = new maps.places.AutocompleteService();
      // PlacesService requires an HTML element or map; we can provide a dummy div
      this.placesService = new maps.places.PlacesService(document.createElement('div'));
    } catch (e) {
      // If instantiation fails, fall back silently
      this.autocompleteService = undefined;
      this.placesService = undefined;
    }
  }

  private handlePlaceSelection(place: any, lat: number, lng: number): void {
    // Find nearest country to label the marker
    const nearest = this.countryService.getNearestCountry(lat, lng);
    const country: Country = {
      name: nearest ? nearest.name : (place.name || 'Selected location'),
      code: nearest ? nearest.code : '',
      latitude: lat,
      longitude: lng,
      capital: nearest ? nearest.capital : undefined,
    };

    this.searchQuery = place.formatted_address || country.name;
    this.showSuggestions = false;
    this.countrySelected.emit(country);
  }

  selectPlacePrediction(prediction: any): void {
    if (!this.placesService) {
      return;
    }
    this.placesService.getDetails({ placeId: prediction.place_id }, (place: any, status: any) => {
      this.ngZone.run(() => {
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          this.handlePlaceSelection(place, lat, lng);
        }
      });
    });
  }

  onSearchInput(): void {
    const q = this.searchQuery.trim();
    if (q.length > 0) {
      // Local country suggestions
      this.suggestions = this.countryService.searchCountries(q);
      // Google Places predictions (if available)
      if (this.autocompleteService) {
        this.autocompleteService.getPlacePredictions({ input: q, types: ['(regions)'] }, (preds: any[]) => {
          this.ngZone.run(() => {
            this.placeSuggestions = preds || [];
            // Show suggestions if either local or place suggestions exist
            this.showSuggestions = (this.suggestions.length + this.placeSuggestions.length) > 0;
            this.selectedIndex = -1;
          });
        });
      } else {
        this.placeSuggestions = [];
        this.showSuggestions = this.suggestions.length > 0;
        this.selectedIndex = -1;
      }
    } else {
      this.suggestions = [];
      this.placeSuggestions = [];
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const total = this.suggestions.length + this.placeSuggestions.length;
    if (!this.showSuggestions || total === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, total - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < total) {
          if (this.selectedIndex < this.suggestions.length) {
            this.selectCountry(this.suggestions[this.selectedIndex]);
          } else {
            const idx = this.selectedIndex - this.suggestions.length;
            this.selectPlacePrediction(this.placeSuggestions[idx]);
          }
        } else if (total > 0) {
          // default to first item
          if (this.suggestions.length > 0) {
            this.selectCountry(this.suggestions[0]);
          } else {
            this.selectPlacePrediction(this.placeSuggestions[0]);
          }
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.selectedIndex = -1;
        break;
    }
  }

  selectCountry(country: Country): void {
    this.searchQuery = country.name;
    this.showSuggestions = false;
    this.selectedIndex = -1;
    this.countrySelected.emit(country);
  }

  onFocus(): void {
    if (this.searchQuery.trim().length > 0 && (this.suggestions.length + this.placeSuggestions.length) > 0) {
      this.showSuggestions = true;
    }
  }

  onBlur(): void {
    // Delay hiding to allow click on suggestion
    setTimeout(() => {
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }, 200);
  }
}
