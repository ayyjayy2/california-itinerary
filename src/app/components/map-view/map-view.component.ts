import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ItineraryService } from '../../services/itinerary.service';
import { TripDay } from '../../models/itinerary.model';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  service = inject(ItineraryService);
  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private polylineLayer?: L.Polyline;

  constructor() {
    effect(() => {
      const day = this.service.selectedDay();
      const cityId = this.service.selectedCityId();
      if (this.map) {
        this.renderDay(day, cityId);
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
    this.renderDay(this.service.selectedDay(), this.service.selectedCityId());
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  get mappedEvents() {
    return this.service.selectedDay().events
      .filter(e => e.location)
      .map((e, i) => ({ ...e, mapNum: i + 1 }));
  }

  getCityColor(cityId: string): string {
    const colors: Record<string, string> = {
      travel: '#8B5CF6',
      sf: '#F59E0B',
      la: '#F43F5E',
      sd: '#0EA5E9',
    };
    return colors[cityId] ?? '#F59E0B';
  }

  private initMap() {
    const el = this.mapContainer.nativeElement;
    this.map = L.map(el, { zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  renderDay(day: TripDay, cityId: string) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    if (this.polylineLayer) {
      this.map.removeLayer(this.polylineLayer);
    }

    const events = day.events.filter(e => e.location);
    const color = this.getCityColor(cityId);

    if (events.length === 0) {
      const lat = day.centerLat ?? 37.7749;
      const lng = day.centerLng ?? -122.4194;
      this.map.setView([lat, lng], day.zoom ?? 12);
      return;
    }

    const latlngs: L.LatLngTuple[] = [];

    events.forEach((event, idx) => {
      if (!event.location) return;
      const { lat, lng } = event.location;
      latlngs.push([lat, lng]);

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          border:2px solid #fff;
        ">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([lat, lng], { icon })
        .bindPopup(`<strong>${event.emoji} ${event.title}</strong>${event.note ? '<br>' + event.note : ''}`)
        .addTo(this.markersLayer!);
    });

    if (latlngs.length > 1) {
      this.polylineLayer = L.polyline(latlngs, {
        color,
        weight: 2.5,
        opacity: 0.6,
        dashArray: '6,6',
      }).addTo(this.map);
    }

    const bounds = L.latLngBounds(latlngs);
    this.map.fitBounds(bounds, { padding: [40, 40] });
  }
}
