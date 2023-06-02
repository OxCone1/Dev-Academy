import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchURL } from '../fetchURL';
import ScaleLoader from "react-spinners/ScaleLoader";
import { CDropdown } from '@coreui/react'
import { CDropdownMenu } from '@coreui/react'
import { CDropdownItem } from '@coreui/react'
import { CDropdownToggle } from '@coreui/react'

export default function StationPaginationComponent({ onClick }) {
    const [stations, setStations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [pageNumbers, setPageNumbers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [limit, setLimit] = useState(30);

    useEffect(() => {
        fetchStations();
    }, [currentPage, searchQuery, limit]);

    const handleClick = (station) => {
        onClick(station);
    };

    const fetchStations = () => {
        setIsLoading(true);

        // Make a request to the server to fetch stations for the current page
        axios
            .get(`${fetchURL}/map/stations?page=${currentPage}&limit=${limit}&search=${searchQuery}`)
            .then((response) => {
                const { stations, totalPages } = response.data;
                setLimit(limit);
                setStations(stations);
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
            setStations([])
        }
    }

    return (
        <div className="pagination-container">
            <div className="pagination-container-top">
                <div className="pagination-container-title">Station list</div>
                <div className="pagination-container-search-container">
                    <input type="text" value={searchQuery} onChange={
                        e => {
                            reset()
                            setSearchQuery(e.target.value)
                        }
                    } placeholder="Search station" />
                </div>
            </div>
            <div className="pagination-container-station-list-container">
                <div className="pagination-container-station-list-item top-lane">
                    <div className="pagination-container-station-list-item-name top-lane">Station</div>
                    <div className="pagination-container-station-list-item-address top-lane">Address</div>
                    <div className="pagination-container-station-list-item-locate top-lane">Locate</div>
                </div>
                {isLoading ? (
                    <>
                        <ScaleLoader className='popup-loader' color="#a0d2eb" height={55} width={4} />
                    </>
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

                    stations.map((station, index) => (
                        <div className={`pagination-container-station-list-item ${index % 2 === 1 ? 'alternate-bg' : ''}`}
                            key={station.ID}
                            onClick={() => handleClick(station)}
                        >
                            <div className="pagination-container-station-list-item-name">{station.Nimi}</div>
                            <div className="pagination-container-station-list-item-address"><i className="fa fa-map-marker" aria-hidden="true"></i>{station.Osoite}</div>
                            <div className="pagination-container-station-list-item-locate"><i class="fa fa-compass fa-lg" aria-hidden="true"></i></div>
                        </div>
                    ))
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
            <div>
                <CDropdown variant="btn-group">
                    <CDropdownToggle color="secondary" size="sm">{limit}/page</CDropdownToggle>
                    <CDropdownMenu>
                        <CDropdownItem onClick={() => {
                            reset(10)
                            setLimit(10)
                        }}>10/page</CDropdownItem>
                        <CDropdownItem onClick={() => {
                            reset(30)
                            setLimit(30)
                        }}>30/page</CDropdownItem>
                        <CDropdownItem onClick={() => {
                            reset(50)
                            setLimit(50)
                        }}>50/page</CDropdownItem>
                        <CDropdownItem onClick={() => {
                            reset(100)
                            setLimit(100)
                        }}>100/page</CDropdownItem>
                    </CDropdownMenu>
                </CDropdown>
            </div>
        </div>
    );
};