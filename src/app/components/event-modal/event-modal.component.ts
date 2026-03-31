import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripEvent } from '../../models/itinerary.model';

interface NominatimResult {
  display_name: string;
  name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.scss',
})
export class EventModalComponent implements OnInit, OnDestroy {
  @Input() event?: TripEvent;
  @Input() cityId = 'sf';
  @Output() save = new EventEmitter<TripEvent>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  form: TripEvent = {
    id: '',
    time: '12:00 PM',
    emoji: '📍',
    title: '',
    note: '',
    location: undefined,
  };

  hasLocation = false;
  locationName = '';
  locationLat = '';
  locationLng = '';
  locationQuery = '';
  locationResults: NominatimResult[] = [];
  locationSearching = false;
  isNew = false;

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    if (this.event) {
      this.form = { ...this.event };
      if (this.event.location) {
        this.hasLocation = true;
        this.locationName = this.event.location.name;
        this.locationLat = String(this.event.location.lat);
        this.locationLng = String(this.event.location.lng);
        this.locationQuery = this.event.location.name;
      }
    } else {
      this.isNew = true;
      this.form.id = crypto.randomUUID();
    }
  }

  ngOnDestroy() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  }

  onLocationInput() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.locationResults = [];
    const q = this.locationQuery.trim();
    if (q.length < 3) return;
    this.searchTimeout = setTimeout(() => this.searchLocation(), 600);
  }

  async searchLocation() {
    const q = this.locationQuery.trim();
    if (!q) { this.locationResults = []; return; }
    this.locationSearching = true;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en-US,en' } });
      this.locationResults = await res.json();
    } catch {
      this.locationResults = [];
    } finally {
      this.locationSearching = false;
    }
  }

  selectLocation(result: NominatimResult) {
    this.locationName = result.name || result.display_name.split(',')[0].trim();
    this.locationLat = result.lat;
    this.locationLng = result.lon;
    this.locationQuery = this.locationName;
    this.locationResults = [];
  }

  clearLocation() {
    this.locationName = '';
    this.locationLat = '';
    this.locationLng = '';
    this.locationQuery = '';
    this.locationResults = [];
  }

  onSave() {
    const evt: TripEvent = {
      ...this.form,
      location: this.hasLocation && this.locationName ? {
        name: this.locationName,
        lat: parseFloat(this.locationLat) || 0,
        lng: parseFloat(this.locationLng) || 0,
      } : undefined,
    };
    this.save.emit(evt);
  }

  onDelete() {
    this.delete.emit(this.form.id);
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
