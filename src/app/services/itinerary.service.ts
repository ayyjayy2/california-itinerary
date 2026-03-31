import { Injectable, signal, computed, inject } from '@angular/core';
import { City, TripDay, TripEvent } from '../models/itinerary.model';
import { DEFAULT_ITINERARY } from '../data/default-itinerary';
import { FirebaseService } from './firebase.service';

const STORAGE_KEY = 'california-travel-itinerary';
const DATA_VERSION = 8; // bump when default-itinerary changes significantly

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private fb = inject(FirebaseService);

  cities = signal<City[]>(this.loadFromStorage());
  selectedCityId = signal<string>('sf');
  selectedDayIndex = signal<number>(0);

  selectedCity = computed(() =>
    this.cities().find(c => c.id === this.selectedCityId()) ?? this.cities()[1]
  );

  selectedDay = computed(() => {
    const city = this.selectedCity();
    const idx = this.selectedDayIndex();
    return city.days[idx] ?? city.days[0];
  });

  /** Exposed so templates can show a sync indicator */
  get synced() { return this.fb.synced; }
  get online() { return this.fb.online; }

  constructor() {
    // Subscribe to real-time Firestore updates
    this.fb.subscribe(
      (cities, dataVersion) => {
        if (dataVersion !== DATA_VERSION) {
          // Firestore has stale data — push new defaults up
          this.cities.set(DEFAULT_ITINERARY);
          this.persist();
        } else {
          // Firestore data is current — use it
          this.cities.set(cities);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
          localStorage.setItem(STORAGE_KEY + '-version', String(DATA_VERSION));
        }
      },
      (_upload) => {
        // Document doesn't exist yet — push our default data up
        this.fb.save(this.cities(), DATA_VERSION);
      },
    );
  }

  // ── Local storage helpers ─────────────────────────────────────────────────

  private loadFromStorage(): City[] {
    try {
      const version = localStorage.getItem(STORAGE_KEY + '-version');
      if (version !== String(DATA_VERSION)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY + '-version', String(DATA_VERSION));
        return DEFAULT_ITINERARY;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_ITINERARY;
  }

  /** Persist to both Firestore and localStorage. */
  private persist(): void {
    const cities = this.cities();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    localStorage.setItem(STORAGE_KEY + '-version', String(DATA_VERSION));
    this.fb.save(cities, DATA_VERSION).catch(err =>
      console.warn('[Firebase] save failed:', err)
    );
  }

  resetToDefault(): void {
    this.cities.set(DEFAULT_ITINERARY);
    this.persist();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  selectCity(cityId: string): void {
    this.selectedCityId.set(cityId);
    this.selectedDayIndex.set(0);
  }

  selectDay(index: number): void {
    this.selectedDayIndex.set(index);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  addEvent(cityId: string, dayId: string, event: TripEvent): void {
    this.cities.update(cities =>
      cities.map(city =>
        city.id !== cityId ? city : {
          ...city,
          days: city.days.map(day =>
            day.id !== dayId ? day : {
              ...day,
              events: [...day.events, event].sort((a, b) =>
                this.parseTime(a.time) - this.parseTime(b.time)
              ),
            }
          ),
        }
      )
    );
    this.persist();
  }

  updateEvent(cityId: string, dayId: string, updated: TripEvent): void {
    this.cities.update(cities =>
      cities.map(city =>
        city.id !== cityId ? city : {
          ...city,
          days: city.days.map(day =>
            day.id !== dayId ? day : {
              ...day,
              events: day.events
                .map(e => e.id === updated.id ? updated : e)
                .sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time)),
            }
          ),
        }
      )
    );
    this.persist();
  }

  toggleVisited(cityId: string, dayId: string, eventId: string): void {
    this.cities.update(cities =>
      cities.map(city =>
        city.id !== cityId ? city : {
          ...city,
          days: city.days.map(day =>
            day.id !== dayId ? day : {
              ...day,
              events: day.events.map(e =>
                e.id !== eventId ? e : { ...e, visited: !e.visited }
              ),
            }
          ),
        }
      )
    );
    this.persist();
  }

  deleteEvent(cityId: string, dayId: string, eventId: string): void {
    this.cities.update(cities =>
      cities.map(city =>
        city.id !== cityId ? city : {
          ...city,
          days: city.days.map(day =>
            day.id !== dayId ? day : {
              ...day,
              events: day.events.filter(e => e.id !== eventId),
            }
          ),
        }
      )
    );
    this.persist();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private parseTime(time: string): number {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
}
