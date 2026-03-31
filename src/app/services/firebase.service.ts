import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';
import { City } from '../models/itinerary.model';

const TRIP_DOC = 'trips/california-2026';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db!: Firestore;
  synced = signal(false);   // true once first Firestore snapshot arrives
  online = signal(true);

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  /** Subscribe to real-time updates. Returns unsubscribe fn. */
  subscribe(
    onData: (cities: City[], dataVersion: number) => void,
    onMissing: (upload: () => void) => void,
  ): Unsubscribe {
    const ref = doc(this.db, TRIP_DOC);

    return onSnapshot(
      ref,
      { includeMetadataChanges: false },
      (snap) => {
        this.online.set(true);
        if (snap.exists()) {
          const data = snap.data();
          onData(data['cities'] as City[], data['dataVersion'] as number ?? 0);
          this.synced.set(true);
        } else {
          onMissing(() => this.save([], 0)); // caller will pass real data
        }
      },
      (err) => {
        console.warn('[Firebase] snapshot error:', err.code);
        this.online.set(false);
      },
    );
  }

  async save(cities: City[], dataVersion: number): Promise<void> {
    const ref = doc(this.db, TRIP_DOC);
    await setDoc(ref, { cities, dataVersion, updatedAt: serverTimestamp() });
  }
}
