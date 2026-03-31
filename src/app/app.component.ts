import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryService } from './services/itinerary.service';
import { WeatherService } from './services/weather.service';
import { CityTabsComponent } from './components/city-tabs/city-tabs.component';
import { DayPickerComponent } from './components/day-picker/day-picker.component';
import { ItineraryViewComponent } from './components/itinerary-view/itinerary-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { TravelDayComponent } from './components/travel-day/travel-day.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CityTabsComponent,
    DayPickerComponent,
    ItineraryViewComponent,
    MapViewComponent,
    BottomNavComponent,
    TravelDayComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  service = inject(ItineraryService);
  weather = inject(WeatherService);
  activeTab = signal<'itinerary' | 'map'>('itinerary');

  get cityId() { return this.service.selectedCityId(); }
  get isTravel() { return this.service.selectedCity().id === 'travel'; }

  ngOnInit() {
    this.weather.fetchAll();
  }

  onTabChange(tab: 'itinerary' | 'map') {
    this.activeTab.set(tab);
  }
}
