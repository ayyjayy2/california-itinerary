export interface TripEvent {
  id: string;
  time: string;
  emoji: string;
  title: string;
  note?: string;
  visited?: boolean;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
}

export interface TripDay {
  id: string;
  date: string;
  dateISO: string;      // "2026-03-01" — used for weather lookup
  label: string;
  isTravel?: boolean;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  events: TripEvent[];
}

export interface City {
  id: 'sf' | 'la' | 'sd' | 'travel';
  name: string;
  shortName: string;
  emoji: string;
  days: TripDay[];
}
