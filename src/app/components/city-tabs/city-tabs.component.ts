import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryService } from '../../services/itinerary.service';

@Component({
  selector: 'app-city-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-tabs.component.html',
  styleUrl: './city-tabs.component.scss',
})
export class CityTabsComponent {
  service = inject(ItineraryService);

  get cities() { return this.service.cities(); }
  get selectedId() { return this.service.selectedCityId(); }

  select(id: string) { this.service.selectCity(id); }
}
