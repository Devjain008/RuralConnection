import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

// Haversine formula to calculate accurate distance between two [lng, lat] coordinate pairs
export const calculateDistanceKm = (coords1, coords2) => {
  if (!coords1 || !coords2) return null;

  const getLngLat = (c) => {
    if (Array.isArray(c)) return { lng: c[0], lat: c[1] };
    if (c.coordinates) return { lng: c.coordinates[0], lat: c.coordinates[1] };
    if (c.lng !== undefined && c.lat !== undefined) return { lng: c.lng, lat: c.lat };
    return null;
  };

  const p1 = getLngLat(coords1);
  const p2 = getLngLat(coords2);

  if (!p1 || !p2 || !p1.lat || !p1.lng || !p2.lat || !p2.lng) return null;

  const R = 6371; // Earth's radius in km
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLon = (p2.lng - p1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
};

export const LocationProvider = ({ children }) => {
  // Default user location: Rampur region [lng, lat]
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('rc_user_location');
    return saved ? JSON.parse(saved) : { coordinates: [79.02, 28.80], name: 'Rampur, UP' };
  });

  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    localStorage.setItem('rc_user_location', JSON.stringify(userLocation));
  }, [userLocation]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation({
          coordinates: [longitude, latitude],
          name: 'My Current Location'
        });
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        // Fallback to default
        setUserLocation({
          coordinates: [79.02, 28.80],
          name: 'Rampur, UP (Default)'
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const setManualLocation = (lng, lat, name) => {
    setUserLocation({
      coordinates: [Number(lng), Number(lat)],
      name: name || 'Custom Location'
    });
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        detecting,
        detectLocation,
        setManualLocation,
        calculateDistance: (targetCoords) => calculateDistanceKm(userLocation.coordinates, targetCoords)
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
