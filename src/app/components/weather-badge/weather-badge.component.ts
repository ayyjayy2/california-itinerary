import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-weather-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-badge.component.html',
  styleUrl: './weather-badge.component.scss',
})
export class WeatherBadgeComponent {
  @Input() dateISO = '';

  wx = inject(WeatherService);

  get weather() { return this.wx.getWeather(this.dateISO); }
  get emoji()   { return this.weather ? this.wx.emoji(this.weather.code) : ''; }
  get desc()    { return this.weather ? this.wx.desc(this.weather.code) : ''; }
  get loading() { return this.wx.loading(); }
}
