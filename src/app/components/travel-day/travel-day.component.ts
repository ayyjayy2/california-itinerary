import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryService } from '../../services/itinerary.service';
import { EventCardComponent } from '../event-card/event-card.component';
import { WeatherBadgeComponent } from '../weather-badge/weather-badge.component';
import { TripEvent } from '../../models/itinerary.model';

@Component({
  selector: 'app-travel-day',
  standalone: true,
  imports: [CommonModule, EventCardComponent, WeatherBadgeComponent],
  templateUrl: './travel-day.component.html',
  styleUrl: './travel-day.component.scss',
})
export class TravelDayComponent {
  service = inject(ItineraryService);

  get day() { return this.service.selectedDay(); }

  onEdit(event: TripEvent) {}
}
