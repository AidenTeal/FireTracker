import { Marker } from '@vis.gl/react-google-maps';

export const FireMarkers = ({ pois }) => {
  return (
    <>
      {pois.map((poi, key) => {
        return (
          <Marker
            key={key}
            position={poi.location}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/128/785/785116.png', // URL to your marker icon
              scaledSize: { width: 32, height: 32 }, // Adjust width and height as needed
            }} />
        );
      })}
    </>
  );
};

