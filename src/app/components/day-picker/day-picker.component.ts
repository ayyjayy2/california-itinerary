import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryService } from '../../services/itinerary.service';

@Component({
  selector: 'app-day-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-picker.component.html',
  styleUrl: './day-picker.component.scss',
})
export class DayPickerComponent {
  service = inject(ItineraryService);

  get days() { return this.service.selectedCity().days; }
  get selectedIndex() { return this.service.selectedDayIndex(); }
  get cityId() { return this.service.selectedCityId(); }

  select(i: number) { this.service.selectDay(i); }
}
