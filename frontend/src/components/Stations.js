import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ScaleLoader from "react-spinners/ScaleLoader";
import axios from 'axios';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import L from 'leaflet';
import { fetchURL } from '../fetchURL';
import stationIcon from '../assets/stationicon.png';


function convertToKm(metres) {
    return (metres / 1000).toFixed(2);
}
function convertToMinutes(seconds) {
    return (seconds / 60).toFixed(2);
}

export default function Stations() {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

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
            .catch((error) => console.log(error));
    }, []);

    const handleMarkerClick = (station) => {
        setIsLoading(true);

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

    return (
        <MapContainer center={[60.22, 24.980069]} zoom={11} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup>
                {stations.map((station) => (
                    <Marker
                        key={station.ID}
                        position={[station.latitude, station.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => handleMarkerClick(station),
                        }}
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
    );

}
