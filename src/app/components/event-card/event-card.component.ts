import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripEvent } from '../../models/itinerary.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
})
export class EventCardComponent {
  @Input() event!: TripEvent;
  @Input() index!: number;
  @Input() cityId!: string;
  @Input() isLast = false;
  @Output() edit = new EventEmitter<TripEvent>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleVisited = new EventEmitter<string>();

  onCardClick() {
    this.edit.emit(this.event);
  }

  onDeleteConfirm() {
    this.delete.emit(this.event.id);
  }

  onToggleVisited() {
    this.toggleVisited.emit(this.event.id);
  }
}
