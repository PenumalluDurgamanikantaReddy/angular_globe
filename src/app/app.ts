import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { GlobeComponent } from './globe/globe.component';
import { Country } from './services/country.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, GlobeComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  @ViewChild(GlobeComponent) globeComponent!: GlobeComponent;
  
  title = 'Globe Explorer';

  onCountrySelected(country: Country): void {
    if (this.globeComponent) {
      this.globeComponent.flyToCountry(country);
    }
  }
}
