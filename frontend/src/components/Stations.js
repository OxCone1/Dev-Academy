import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import ScaleLoader from "react-spinners/ScaleLoader";
import axios from 'axios';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import L from 'leaflet';
import { fetchURL } from '../fetchURL';
import stationIcon from '../assets/stationicon.png';
import StationPaginationComponent from './StationPaginationComponent';



function convertToKm(metres) {
    return (metres / 1000).toFixed(2);
}

export default function Stations() {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const mapRef = useRef(null);
    const [previousZoom, setPreviousZoom] = useState(null);
    const markerRefs = useRef({});

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

    const handlePopupOpen = (station) => {

        setIsLoading(true);
        // Access the map instance and perform zoom and center operations
        const map = mapRef.current;
        const marker = markerRefs.current[station.ID];
        if (map && marker) {
            setPreviousZoom(map.getZoom());
            map.flyTo([station.latitude, station.longitude], 16);
            
            map.once('zoomend', () => {
                marker.openPopup();
              });
        }

        axios
            .post(`${fetchURL}/map/getStation`, { ID: station.ID })
            .then((response) => {
                setIsError(false);
                setSelectedStation(response.data);
            })
            .catch((error) => {
                setIsError(true);
                console.log(error)
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // const handlePopupClose = (station) => {
    //     // Reset the selected station and zoom when the popup is closed
    //     const map = mapRef.current;
    //     if (map) {
    //         map.flyTo([station.latitude, station.longitude], previousZoom);
    //     }
    // };

    return (
        <div className="mapContainer">
            <StationPaginationComponent
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
                            eventHandlers={{
                                popupopen: () => handlePopupOpen(station),
                                // popupclose: () => handlePopupClose(station),
                            }}
                            ref={(marker) => { markerRefs.current[station.ID] = marker; }} // Store marker instance in the ref
                        >
                            <Popup autoClose={false} className="popup-content">
                                <div className='popup-location'>
                                    <div className='popup-location-name'>
                                        {station.Nimi} <i className="fa fa-podcast" aria-hidden="true"></i>
                                    </div>
                                    <div className='popup-location-address'>
                                        <div>{station.Osoite} <i className="fa fa-map-marker" aria-hidden="true"></i></div>
                                        <div className='popup-location-capacity'>{station.capacity} <i className="fa fa-bicycle" aria-hidden="true"></i></div>
                                    </div>
                                    <div className='popup-statistics'>
                                        <div>Statistics</div>
                                        <i className="fa fa-bar-chart" aria-hidden="true"></i>
                                    </div>


                                    {isLoading ? (
                                        <>
                                            <ScaleLoader className='popup-loader' color="#d0bdf4" height={25} width={3} />
                                        </>
                                    ) : (
                                        //if there is an error, show error message and don't show the rest of the popup
                                        isError ? (
                                            <div className='popup-error'>
                                                <div className='popup-error-sign'>
                                                    <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> Error
                                                </div>
                                                <div className='popup-error-sign message'>
                                                    <i className="fa fa-exclamation-circle" aria-hidden="true"></i> No data available
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {selectedStation && (
                                                    <div className='popup-statistics-all'>
                                                        <div className='popup-avg-text'>
                                                            <div className="fa fa-road" aria-hidden="true"></div>
                                                            <div>Distance of journeys (avg.)</div>
                                                        </div>
                                                        <div className='popup-avg-data-container'>
                                                            <div className='popup-avg-data-arriving'>
                                                                <i className="fa fa-repeat" aria-hidden="true"></i>
                                                                <div>Arrivals</div>
                                                            </div>
                                                            <div className='popup-avg-data-leaving'>
                                                                <i className="fa fa-undo" aria-hidden="true"></i>
                                                                <div>Departures</div>
                                                            </div>
                                                            <div>
                                                                {convertToKm(selectedStation.avgDistanceFrom)} km
                                                            </div>
                                                            <div>
                                                                {convertToKm(selectedStation.avgDistanceTo)} km
                                                            </div>
                                                        </div>
                                                        <div className='popup-avg-text'>
                                                            <div className="fa fa-star" aria-hidden="true"></div>
                                                            <div>Popular Stations</div>
                                                        </div>
                                                        <div className='top-stations-container'>
                                                            <div className='top-stations-data-arriving'>
                                                                <i className="fa fa-repeat" aria-hidden="true"></i>
                                                                <div>Arrivals</div>
                                                            </div>
                                                            <div className='top-stations-data-leaving'>
                                                                <i className="fa fa-undo" aria-hidden="true"></i>
                                                                <div>Departures</div>
                                                            </div>
                                                            <div className="top-stations">
                                                                {selectedStation.topReturnStations.map((returnStation) => (
                                                                    <div className='top-stations-item' key={returnStation.station._id}>
                                                                        <i className="fa fa-angle-right" aria-hidden="true"></i> {returnStation.station.Nimi}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="top-stations">
                                                                {selectedStation.topDepartureStations.map((departureStation) => (
                                                                    <div className='top-stations-item' key={departureStation.station._id}>
                                                                        <i className="fa fa-angle-right" aria-hidden="true"></i> {departureStation.station.Nimi}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}
