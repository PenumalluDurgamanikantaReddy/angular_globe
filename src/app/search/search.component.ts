import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService, Country } from '../services/country.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  @Output() countrySelected = new EventEmitter<Country>();
  
  searchQuery: string = '';
  suggestions: Country[] = [];
  showSuggestions: boolean = false;
  selectedIndex: number = -1;

  constructor(private countryService: CountryService) {}

  onSearchInput(): void {
    if (this.searchQuery.trim().length > 0) {
      this.suggestions = this.countryService.searchCountries(this.searchQuery);
      this.showSuggestions = this.suggestions.length > 0;
      this.selectedIndex = -1;
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions || this.suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
          this.selectCountry(this.suggestions[this.selectedIndex]);
        } else if (this.suggestions.length > 0) {
          this.selectCountry(this.suggestions[0]);
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
    if (this.searchQuery.trim().length > 0 && this.suggestions.length > 0) {
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
