import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchURL } from '../fetchURL';
import ScaleLoader from "react-spinners/ScaleLoader";
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CButtonGroup, CButton, CDropdownDivider } from '@coreui/react';

export default function JourneyPaginationComponent({ onClick }) {
    const [journeys, setJourneys] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [pageNumbers, setPageNumbers] = useState([]);
    const [limit, setLimit] = useState(30);
    const [searchParams, setSearchParams] = useState({});

    useEffect(() => {
        fetchJourneys();
    }, [currentPage, limit, searchParams]);

    const handleClick = (startID, endID) => {
        onClick(startID, endID);
    };

    const fetchJourneys = () => {
        setIsLoading(true);

        axios
            .post(`${fetchURL}/map/journeys`,
                {
                    "options": {
                        "limit": limit,
                        "page": currentPage,
                        "sort": searchParams,
                        "filter": {}
                    }
                }
            )
            .then((response) => {
                const { journeys, totalPages } = response.data;
                setLimit(limit);
                setJourneys(journeys);
                setTotalPages(totalPages);
                setIsError(false);
            })
            .catch((error) => {
                alert('Error fetching station data');
                console.log(error);
                setIsError(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        generatePageNumbers();
    }, [currentPage, totalPages]);

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const maxVisiblePages = 3;
        const pageRange = Math.floor((maxVisiblePages - 3) / 2);
        const totalVisiblePages = Math.min(totalPages, maxVisiblePages);
        let startPage = Math.max(1, currentPage - pageRange);
        let endPage = Math.min(startPage + totalVisiblePages - 1, totalPages);

        if (endPage - startPage < totalVisiblePages - 1) {
            startPage = Math.max(1, endPage - totalVisiblePages + 1);
        }

        const numbers = [];
        for (let i = startPage; i <= endPage; i++) {
            if (i !== 1 && i !== totalPages) {
                numbers.push(i);
            }
        }
        setPageNumbers(numbers);
    };

    const goToPage = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const goToFirstPage = () => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    };

    const goToLastPage = () => {
        if (currentPage !== totalPages) {
            setCurrentPage(totalPages);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const reset = (number) => {
        if (number != limit) {
            setCurrentPage(1)
            setJourneys([])
        }
    }

    function convertToDistance(metres) {
        let distance = '';
      
        if (metres <= 1000) {
          distance = `${metres} m`;
        } else {
          const km = (metres / 1000).toFixed(2);
          distance = `${km} km`;
        }
      
        return distance;
      }

    function convertToTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const remainingSeconds = seconds % 3600;

        const minutes = Math.floor(remainingSeconds / 60);
        const remainingSecondsInSeconds = remainingSeconds % 60;

        let formattedTime = '';

        if (hours > 0) {
            formattedTime += `${hours < 10 ? '0' : ''}${hours}:`;
        }

        formattedTime += `${minutes < 10 ? '0' : ''}${minutes}:${remainingSecondsInSeconds < 10 ? '0' : ''}${remainingSecondsInSeconds}`;

        return formattedTime;
    }
    function constructDate(dateString, type) {
        var date = new Date(dateString);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        var seconds = String(date.getSeconds()).padStart(2, '0');

        if (type === 'date') {
            return `${day}-${month}-${year}`;
        } else if (type === 'time') {
            return `${hours}:${minutes}:${seconds}`;
        } else {
            return 'Invalid type';
        }
    }
    return (
        <div className="pagination-container">
            <div className="pagination-container-top">
                <div className="pagination-container-title">Journey list</div>
            </div>
            <div className="pagination-container-journey-list-container">
                <div className="pagination-container-journey-list-item top-lane-journey">
                    <CButtonGroup role="group" aria-label="Button group with nested dropdown">
                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">From</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.departure_station_name === 1} onClick={() => setSearchParams({ ...searchParams, departure_station_name: 1 })}>Sort A-Z</CDropdownItem>
                                <CDropdownItem disabled={searchParams.departure_station_name === -1} onClick={() => setSearchParams({ ...searchParams, departure_station_name: -1 })}>Sort Z-A</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { departure_station_name, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">To</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.return_station_name === 1} onClick={() => setSearchParams({ ...searchParams, return_station_name: 1 })}>Sort A-Z</CDropdownItem>
                                <CDropdownItem disabled={searchParams.return_station_name === -1} onClick={() => setSearchParams({ ...searchParams, return_station_name: -1 })}>Sort Z-A</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { return_station_name, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">Started</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.departure === -1} onClick={() => setSearchParams({ ...searchParams, departure: -1 })}>Newest first</CDropdownItem>
                                <CDropdownItem disabled={searchParams.departure === 1} onClick={() => setSearchParams({ ...searchParams, departure: 1 })}>Oldest first</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { departure, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">Finished</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.returnDate === -1} onClick={() => setSearchParams({ ...searchParams, returnDate: -1 })}>Newest first</CDropdownItem>
                                <CDropdownItem disabled={searchParams.returnDate === 1} onClick={() => setSearchParams({ ...searchParams, returnDate: 1 })}>Oldest first</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { returnDate, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">Duration</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.duration === 1} onClick={() => setSearchParams({ ...searchParams, duration: 1 })}>Fastest first</CDropdownItem>
                                <CDropdownItem disabled={searchParams.duration === -1} onClick={() => setSearchParams({ ...searchParams, duration: -1 })}>Slowest first</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { duration, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>

                        <CDropdown variant="btn-group">
                            <CDropdownToggle color="primary">Distance</CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem disabled={searchParams.coveredDistance === 1} onClick={() => setSearchParams({ ...searchParams, coveredDistance: 1 })}>Shortest first</CDropdownItem>
                                <CDropdownItem disabled={searchParams.coveredDistance === -1} onClick={() => setSearchParams({ ...searchParams, coveredDistance: -1 })}>Longest first</CDropdownItem>
                                <CDropdownDivider />
                                <CDropdownItem onClick={() => {
                                    const { coveredDistance, ...restSearchParams } = searchParams;
                                    setSearchParams(restSearchParams);
                                }}>Reset</CDropdownItem>
                                <CDropdownItem onClick={() => setSearchParams({})}>Reset all</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </CButtonGroup>
                </div>
                {isLoading ? (
                    <div className='popup-loader pagination-loader'>
                        <ScaleLoader color="#a0d2eb" height={55} width={4} />
                    </div>
                ) : isError ? (
                    <div className='popup-error'>
                        <div className='popup-error-sign'>
                            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i> Error
                        </div>
                        <div className='popup-error-sign message'>
                            <i className="fa fa-exclamation-circle" aria-hidden="true"></i> No data available
                        </div>
                    </div>
                ) : (

                    journeys.map((journey, index) => {
                        let departureDate = constructDate(journey.departure, "date")
                        let returnDate = constructDate(journey.returnDate, "date")
                        let departureTime = constructDate(journey.departure, "time")
                        let returnTime = constructDate(journey.returnDate, "time")
                        let departureStation = journey.departure_station_name
                        let returnStation = journey.return_station_name
                        let duration = convertToTime(journey.duration);
                        let distance = convertToDistance(journey.coveredDistance);

                        return (
                            <div className={`pagination-container-journey-list-item ${index % 2 === 1 ? 'alternate-bg' : ''}`}
                                key={journey._id}
                                onClick={() => handleClick(journey.departure_station_id, journey.return_station_id)}
                            >
                                <div>{departureStation}</div>
                                <div>{returnStation}</div>
                                <div>
                                    <div>{departureTime}</div>
                                    <div>{departureDate}</div>
                                </div>
                                <div>
                                    <div>{returnTime}</div>
                                    <div>{returnDate}</div>
                                </div>
                                <div>{duration}</div>
                                <div>{distance}</div>
                            </div>
                        )
                    })
                )}
            </div>
            <div className="pagination-container-buttons">
                <div className='pagination-container-side-arrows'>
                    <button onClick={goToFirstPage} disabled={currentPage === 1}>
                        <i className="fa fa-angle-double-left fa-lg" aria-hidden="true"></i>
                    </button>
                    <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                        <i className="fa fa-angle-left fa-lg" aria-hidden="true"></i>
                    </button>
                </div>
                <div className='pagination-container-page-numbers'>
                    <button
                        onClick={() => goToPage(1)}
                        className={currentPage === 1 ? 'active' : ''}
                    >
                        1
                    </button>

                    {currentPage > 4 && totalPages > 6 && (
                        <span className="pagination-ellipsis">...</span>
                    )}

                    {pageNumbers.map((number) => (
                        <button
                            key={number}
                            onClick={() => goToPage(number)}
                            className={currentPage === number ? 'active' : ''}
                        >
                            {number}
                        </button>
                    ))}

                    {currentPage < totalPages - 3 && totalPages > 6 && (
                        <span className="pagination-ellipsis">...</span>
                    )}

                    {totalPages > 1 && (
                        <button
                            onClick={() => goToPage(totalPages)}
                            className={currentPage === totalPages ? 'active' : ''}
                        >
                            {totalPages}
                        </button>
                    )}
                </div>
                <div className='pagination-container-side-arrows'>
                    <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                        <i className="fa fa-angle-right fa-lg" aria-hidden="true"></i>
                    </button>
                    <button onClick={goToLastPage} disabled={currentPage === totalPages}>
                        <i className="fa fa-angle-double-right fa-lg" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div className='limit'>
                <CDropdown variant="btn-group">
                    <CDropdownToggle color="secondary" size="sm">{limit}/page</CDropdownToggle>
                    <CDropdownMenu>
                        <CDropdownItem disabled={limit === 10} onClick={() => {
                            reset(10)
                            setLimit(10)
                        }}>10/page</CDropdownItem>
                        <CDropdownItem disabled={limit === 30} onClick={() => {
                            reset(30)
                            setLimit(30)
                        }}>30/page</CDropdownItem>
                        <CDropdownItem disabled={limit === 50} onClick={() => {
                            reset(50)
                            setLimit(50)
                        }}>50/page</CDropdownItem>
                        <CDropdownItem disabled={limit === 100} onClick={() => {
                            reset(100)
                            setLimit(100)
                        }}>100/page</CDropdownItem>
                    </CDropdownMenu>
                </CDropdown>
            </div>
        </div>
    );
};