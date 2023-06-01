import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import axios from 'axios';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import L from 'leaflet';
import { fetchURL } from '../fetchURL';
import stationIcon from '../assets/stationicon.png';
import JourneyPaginationComponent from './JourneyPaginationComponent';

export default function Journeys() {
  const [stations, setStations] = useState([]);
  const mapRef = useRef(null);

  const customIcon = L.icon({
    iconUrl: stationIcon,
    iconSize: [32, 32],
  });

  useEffect(() => {
    // Fetch station data from the server
    axios
      .get(`${fetchURL}/map/stations`)
      .then((response) => {
        setStations(response.data.stations);
      })
      .catch((error) => {
        alert("Error fetching station data");
        console.log(error)
      });
  }, []);

  const handlePopupOpen = (startStationID, endStationId) => {
    const map = mapRef.current;
    if (map) {

      const startStation = stations.find(station => station.ID === startStationID);
      const endStation = stations.find(station => station.ID === endStationId);
      console.log(startStation);
      console.log(endStation);
      if (startStation === undefined || endStation === undefined) {
        alert("Station location data is missing");
        return;
      }
      else {

        const startMarker = L.marker([startStation.latitude, startStation.longitude], { icon: customIcon }).addTo(map);
        const endMarker = L.marker([endStation.latitude, endStation.longitude], { icon: customIcon }).addTo(map);

        const startPopup = L.popup({ className: "popup-content", autoClose: false, closeOnClick: false })
          .setContent(`
          <div class="popup-location">
            <div class="popup-location-name">
              ${startStation.Nimi} <i class="fa fa-podcast" aria-hidden="true"></i>
            </div>
            <div class="popup-location-address">
              <div>${startStation.Osoite} <i class="fa fa-map-marker" aria-hidden="true"></i></div>
              <div class="popup-location-capacity">${startStation.capacity} <i class="fa fa-bicycle" aria-hidden="true"></i></div>
            </div>
          </div>
        `);

        const endPopup = L.popup({ className: "popup-content", autoClose: false, closeOnClick: false })
          .setContent(`
          <div class="popup-location">
            <div class="popup-location-name">
              ${endStation.Nimi} <i class="fa fa-podcast" aria-hidden="true"></i>
            </div>
            <div class="popup-location-address">
              <div>${endStation.Osoite} <i class="fa fa-map-marker" aria-hidden="true"></i></div>
              <div class="popup-location-capacity">${endStation.capacity} <i class="fa fa-bicycle" aria-hidden="true"></i></div>
            </div>
          </div>
        `);

        const polyline = L.polyline(
          [[startStation.latitude, startStation.longitude], [endStation.latitude, endStation.longitude]],
          { color: '#F22F0D' }
        )

        map.flyTo([startStation.latitude, startStation.longitude], 16);

        map.once('zoomend', () => {
          map.addLayer(polyline);
          startMarker.bindPopup(startPopup).openPopup();
        });

        map.once('zoomend', () => {
          map.flyTo([endStation.latitude, endStation.longitude], 16);

          map.once('zoomend', () => {
            endMarker.bindPopup(endPopup).openPopup();
          });
        });

        setTimeout(() => {
          const bounds = L.latLngBounds([
            [startStation.latitude, startStation.longitude],
            [endStation.latitude, endStation.longitude]
          ]);

          map.fitBounds(bounds, { padding: [100, 100] });

          setTimeout(() => {
            map.removeLayer(polyline);
            startMarker.closePopup();
            endMarker.closePopup();
            map.removeLayer(startMarker);
            map.removeLayer(endMarker);
          }, 3000);
        }, 5000);
      }
    }
  };

  return (
    <div className="mapContainer-journey">
      <JourneyPaginationComponent
        onClick={handlePopupOpen}
      />
      <MapContainer className='map' ref={mapRef} center={[60.22, 24.980069]} zoom={11} scrollWheelZoom={true} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <MarkerClusterGroup>
          {stations.map((station) => (
            <Marker
              key={station.ID}
              position={[station.latitude, station.longitude]}
              icon={customIcon}
            >
              <Popup className="popup-content">
                <div className='popup-location'>
                  <div className='popup-location-name'>
                    {station.Nimi} <i className="fa fa-podcast" aria-hidden="true"></i>
                  </div>
                  <div className='popup-location-address'>
                    <div>{station.Osoite} <i className="fa fa-map-marker" aria-hidden="true"></i></div>
                    <div className='popup-location-capacity'>{station.capacity} <i className="fa fa-bicycle" aria-hidden="true"></i></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
