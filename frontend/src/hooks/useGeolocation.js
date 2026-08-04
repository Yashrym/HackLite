import { useCallback, useEffect, useState } from 'react';

/**
 * Browser geolocation with optional manual fallback coordinates.
 */
export function useGeolocation(manualLat, manualLng) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const capture = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    capture();
  }, [capture]);

  const latitude =
    manualLat !== '' && manualLat != null && !Number.isNaN(Number(manualLat))
      ? Number(manualLat)
      : coords?.latitude;
  const longitude =
    manualLng !== '' && manualLng != null && !Number.isNaN(Number(manualLng))
      ? Number(manualLng)
      : coords?.longitude;

  const hasLocation =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  return { coords, latitude, longitude, hasLocation, error, loading, refresh: capture };
}
