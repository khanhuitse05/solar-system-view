import { useEffect, useState } from 'react';
import type { GeoPosition } from '../types';
import { defaultLocation } from '../utils/realtimeAstronomy';

type GeolocationState = {
  position: GeoPosition;
  status: 'locating' | 'granted' | 'denied' | 'unsupported' | 'error';
  error: string | null;
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: defaultLocation(),
    status: 'locating',
    error: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({
        position: defaultLocation(),
        status: 'unsupported',
        error: 'Geolocation unavailable; using Ho Chi Minh City fallback.',
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (reading) => {
        setState({
          position: {
            latitude: reading.coords.latitude,
            longitude: reading.coords.longitude,
            altitudeMeters: reading.coords.altitude ?? undefined,
            accuracyMeters: reading.coords.accuracy,
          },
          status: 'granted',
          error: null,
        });
      },
      (error) => {
        setState({
          position: defaultLocation(),
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'error',
          error: `${error.message}; using Ho Chi Minh City fallback.`,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 10_000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
