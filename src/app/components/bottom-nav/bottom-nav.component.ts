import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  @Input() activeTab: 'itinerary' | 'map' = 'itinerary';
  @Input() cityId = 'sf';
  @Output() tabChange = new EventEmitter<'itinerary' | 'map'>();
}
