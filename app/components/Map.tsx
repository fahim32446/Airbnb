'use client';

import { useToast } from '@/hooks/use-toast';
import { icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import { useCountries } from '../lib/getCountries';

const ICON = icon({
  iconUrl:
    'https://images.vexels.com/media/users/3/131261/isolated/preview/b2e48580147ca0ed3f970f30bf8bb009-karten-standortmarkierung.png',
  iconSize: [50, 50],
});

function MoveMapToLocation({
  position,
}: {
  position: LatLngExpression | null;
}) {
  const map = useMap();

  if (position) map.setView(position, 16);
  return null;
}

export default function Map({
  locationValue,
  setLocationAttribute,
}: {
  locationValue: string;
  setLocationAttribute?: Dispatch<SetStateAction<LatLngExpression | undefined>>;
}) {
  const { toast } = useToast();
  const { getCountryByValue } = useCountries();

  const latLang = useMemo(
    () => getCountryByValue(locationValue)?.latLang,
    [locationValue, getCountryByValue]
  );

  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    latLang ?? [52.505, -0.09]
  );

  useEffect(() => {
    if (latLang) {
      setMarkerPosition(latLang);
    }
  }, [latLang]);

  function MapClickHandler() {
    useMapEvent('click', (event) => {
      setMarkerPosition([event.latlng.lat, event.latlng.lng]);
    });
    return null;
  }

  const currentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: [number, number] = [latitude, longitude];
          setMarkerPosition(newLocation);
        },
        (error) => {
          console.error('Error getting current location:', error);

          toast({
            title: 'Location Access Denied',
            description:
              'It seems that you have denied location access. Please enable location access in your browser settings.',
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    if (markerPosition && setLocationAttribute) {
      setLocationAttribute(markerPosition);
    }
  }, [setLocationAttribute]);

  return (
    <>
      <MapContainer
        scrollWheelZoom={true}
        className='h-[50vh] rounded-lg relative z-0'
        center={markerPosition ?? [52.505, -0.09]}
        zoom={8}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {/* Marker should always be at markerPosition */}
        {markerPosition && <Marker position={markerPosition} icon={ICON} />}

        {/* Add click handler for setting new marker position */}
        <MapClickHandler />
        <MoveMapToLocation position={markerPosition} />
      </MapContainer>

      {setLocationAttribute && (
        <div
          onClick={(e) => currentLocation()}
          className='mt-2 cursor-pointer border w-fit px-3 rounded bg-primary text-white py-1'
        >
          <span className='flex gap-2'>
            <LocateIcon />
            Detect my current location
          </span>
        </div>
      )}
    </>
  );
}
