import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import GlobeGL from 'globe.gl';
import { Country } from '../services/country.service';

interface Marker {
  lat: number;
  lng: number;
  label: string;
  size: number;
  color: string;
}

@Component({
  selector: 'app-globe',
  standalone: true,
  imports: [],
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeContainer', { static: false }) globeContainer!: ElementRef;
  
  private globe: any;
  private markers: Marker[] = [];
  private animationFrameId: number | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initGlobe();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initGlobe(): void {
    const container = this.globeContainer.nativeElement;
    
    this.globe = new GlobeGL(container)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .pointsData(this.markers)
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(0.6)
      .pointLabel('label')
      .atmosphereColor('lightskyblue')
      .atmosphereAltitude(0.25);

    // Set initial camera position
    this.globe.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0);

    // Auto-rotate
    this.globe.controls().autoRotate = true;
    this.globe.controls().autoRotateSpeed = 0.5;
    this.globe.controls().enableZoom = true;
  }

  async flyToCountry(country: Country): Promise<void> {
    // Stop auto-rotation during animation
    this.globe.controls().autoRotate = false;

    // Add marker for this location
    this.addMarker(country);

    // Get current camera position
    const currentPOV = this.globe.pointOfView();

    // Phase 1: Zoom out
    await this.animateCamera(
      { lat: currentPOV.lat, lng: currentPOV.lng, altitude: 3.5 },
      1000
    );

    // Phase 2: Rotate to target (at high altitude)
    await this.animateCamera(
      { lat: country.latitude, lng: country.longitude, altitude: 3.5 },
      1500
    );

    // Phase 3: Zoom in to target
    await this.animateCamera(
      { lat: country.latitude, lng: country.longitude, altitude: 1.5 },
      1200
    );

    // Resume auto-rotation after a delay
    setTimeout(() => {
      this.globe.controls().autoRotate = true;
    }, 2000);
  }

  private animateCamera(
    targetPOV: { lat: number; lng: number; altitude: number },
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPOV = this.globe.pointOfView();
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentPOV = {
          lat: startPOV.lat + (targetPOV.lat - startPOV.lat) * eased,
          lng: this.interpolateLongitude(startPOV.lng, targetPOV.lng, eased),
          altitude: startPOV.altitude + (targetPOV.altitude - startPOV.altitude) * eased
        };

        this.globe.pointOfView(currentPOV, 0);

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  private interpolateLongitude(start: number, end: number, progress: number): number {
    // Handle longitude wrapping (shortest path)
    let diff = end - start;
    
    if (diff > 180) {
      diff -= 360;
    } else if (diff < -180) {
      diff += 360;
    }
    
    let result = start + diff * progress;
    
    // Normalize to -180 to 180
    while (result > 180) result -= 360;
    while (result < -180) result += 360;
    
    return result;
  }

  private addMarker(country: Country): void {
    const marker: Marker = {
      lat: country.latitude,
      lng: country.longitude,
      label: country.name,
      size: 0.05,
      color: '#ff6b6b'
    };

    this.markers.push(marker);
    this.globe.pointsData(this.markers);
  }

  clearMarkers(): void {
    this.markers = [];
    this.globe.pointsData(this.markers);
  }
}
