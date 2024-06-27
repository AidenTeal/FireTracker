import {Marker} from '@vis.gl/react-google-maps';

export const UserMarker = ({pois}) => {
    return (
        <>
            <Marker
              key={"userLocation"}
              position={pois.location} 
              icon={{
                url: 'https://cdn-icons-png.flaticon.com/128/2163/2163350.png', // URL to your marker icon
                scaledSize: { width: 32, height: 32 }, // Adjust width and height as needed
              }} />
        </>
      );
}