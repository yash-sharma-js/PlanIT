import React, { useEffect, useState } from 'react';

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

const LocationFetcher: () => JSX.Element = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setLocation(data);
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="p-4 rounded-md border max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Your Location Info</h2>
      {loading ? (
        <p>Fetching your location...</p>
      ) : location ? (
        <div className="space-y-2">
          <p><strong>IP:</strong> {location.ip}</p>
          <p><strong>City:</strong> {location.city}</p>
          <p><strong>Region:</strong> {location.region}</p>
          <p><strong>Country:</strong> {location.country_name}</p>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
        </div>
      ) : (
        <p>Failed to fetch location.</p>
      )}
    </div>
  );
};

export default LocationFetcher;
