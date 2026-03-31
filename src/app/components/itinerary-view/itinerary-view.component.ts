import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryService } from '../../services/itinerary.service';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { WeatherBadgeComponent } from '../weather-badge/weather-badge.component';
import { TripEvent } from '../../models/itinerary.model';

@Component({
  selector: 'app-itinerary-view',
  standalone: true,
  imports: [CommonModule, EventCardComponent, EventModalComponent, WeatherBadgeComponent],
  templateUrl: './itinerary-view.component.html',
  styleUrl: './itinerary-view.component.scss',
})
export class ItineraryViewComponent {
  service = inject(ItineraryService);

  editingEvent = signal<TripEvent | undefined>(undefined);
  showModal = signal(false);
  isNew = signal(false);

  get day() { return this.service.selectedDay(); }
  get cityId() { return this.service.selectedCityId(); }

  openEdit(event: TripEvent) {
    this.editingEvent.set({ ...event });
    this.isNew.set(false);
    this.showModal.set(true);
  }

  openAdd() {
    this.editingEvent.set(undefined);
    this.isNew.set(true);
    this.showModal.set(true);
  }

  onSave(event: TripEvent) {
    const day = this.day;
    const cityId = this.cityId;
    if (this.isNew()) {
      this.service.addEvent(cityId, day.id, event);
    } else {
      this.service.updateEvent(cityId, day.id, event);
    }
    this.showModal.set(false);
  }

  onToggleVisited(eventId: string) {
    this.service.toggleVisited(this.cityId, this.day.id, eventId);
  }

  onDelete(eventId: string) {
    this.service.deleteEvent(this.cityId, this.day.id, eventId);
    if (this.showModal()) this.showModal.set(false);
  }

  closeModal() {
    this.showModal.set(false);
  }
}
