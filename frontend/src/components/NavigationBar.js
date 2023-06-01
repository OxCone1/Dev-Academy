import React, { useState, useContext } from 'react';
import { NavLink, } from 'react-router-dom';
import { UserAuthContext } from '../Context';
import { fetchURL } from '../fetchURL';
import axios from 'axios';
import '../App.css'
import { InputGroup, Input } from 'rsuite';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CFormInput, CDropdownDivider, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle } from '@coreui/react';

const NavigationBar = () => {
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [addJourneyVisible, setAddJourneyVisible] = useState(false);
    const [addStationVisible, setAddStationVisible] = useState(false);
    const UserAuthContextValue = useContext(UserAuthContext);
    const [station, setStationData] = useState({});
    const [journey, setJourneyData] = useState({});

    function logout() {
        UserAuthContextValue.logout();
    }
    const config = {
        headers: {
            Authorization: `Bearer ${UserAuthContextValue.jwt}`,
        },
    };
    function handleLogin() {
        const loginData = {
            username: username,
            password: password,
        };

        axios.post(fetchURL + '/user/login', loginData)
            .then((response) => {
                // Handle successful login, e.g., set user authentication token in context
                UserAuthContextValue.login(response.data.token);
                setVisible(false);
            })
            .catch((error) => {
                // Handle login error
                console.log('Login failed:', error);
            });
    }

    const handleAddStation = () => {
        axios
            .post(fetchURL + '/map/station', { station }, config)
            .then((response) => {
                setAddStationVisible(false);
                setStationData({});
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleAddJourney = () => {
        console.log(journey);
        axios
            .post(fetchURL + '/map/journey', { journey }, config)
            .then((response) => {
                setAddJourneyVisible(false);
                setJourneyData({});
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <nav className="navigbar">
            <div className="navContainer">
                <NavLink to="/" className="navbar-brand">
                    Home
                </NavLink>
                <div className="navbar-selector">
                    <div className="nav-item">
                        <NavLink to="/stations" className="nav-link">Stations</NavLink>
                    </div>
                    <div className="nav-item">
                        <NavLink to="/journeys" className="nav-link">Journeys</NavLink>
                    </div>
                </div>
                <div className="nav-item-login">
                    {UserAuthContextValue.jwt != null ?
                        (
                            <>
                                {/* <CButton onClick={() => <Navigate to="/input" replace={true} />}>Add Journey</CButton> */}
                                <CDropdown>
                                    <CDropdownToggle color="secondary">Add</CDropdownToggle>
                                    <CDropdownMenu>
                                        <CDropdownItem onClick={() => setAddJourneyVisible(!visible)}>Journey</CDropdownItem>
                                        <CDropdownItem onClick={() => setAddStationVisible(!visible)}>Station</CDropdownItem>
                                    </CDropdownMenu>
                                </CDropdown>
                                <CButton onClick={() => logout()}>Logout</CButton>
                            </>
                        ) : (<CButton onClick={() => setVisible(!visible)}>Login</CButton>)}
                </div>
            </div>

            <CModal backdrop={'static'} visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Login</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CFormInput
                        type="text"
                        placeholder="Username"
                        aria-label="username input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <CDropdownDivider />
                    <CFormInput
                        type="password"
                        placeholder="Password"
                        aria-label="password input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Close
                    </CButton>
                    <CButton color="primary" onClick={handleLogin}>
                        Login
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal backdrop={'static'} visible={addStationVisible} onClose={() => setAddStationVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Add Station</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <InputGroup>
                        <InputGroup.Addon>Nimi</InputGroup.Addon>
                        <Input type='text' onChange={(value, event) => setStationData({ ...station, Nimi: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Osoite</InputGroup.Addon>
                        <Input type='text' onChange={(value, event) => setStationData({ ...station, Osoite: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Latitude</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setStationData({ ...station, latitude: parseFloat(value) })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Longitude</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setStationData({ ...station, longitude: parseFloat(value) })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Capacity</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setStationData({ ...station, capacity: parseInt(value) })} />
                    </InputGroup>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setAddStationVisible(false)}>
                        Close
                    </CButton>
                    <CButton color="primary" onClick={handleAddStation}>
                        Add Station
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal backdrop={'static'} visible={addJourneyVisible} onClose={() => setAddJourneyVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Add Journey</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <InputGroup>
                        <InputGroup.Addon>Departure</InputGroup.Addon>
                        <Input type='datetime-local' step="1" inputmode="numeric" onChange={(value, event) => setJourneyData({ ...journey, departure: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Return Date</InputGroup.Addon>
                        <Input type='datetime-local' step="1" inputmode="numeric" onChange={(value, event) => setJourneyData({ ...journey, returnDate: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Departure Station ID</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setJourneyData({ ...journey, departure_station_id: parseInt(value) })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Return Station ID</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setJourneyData({ ...journey, return_station_id: parseInt(value) })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Departure Station Name</InputGroup.Addon>
                        <Input type='text' onChange={(value, event) => setJourneyData({ ...journey, departure_station_name: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Return Station Name</InputGroup.Addon>
                        <Input type='text' onChange={(value, event) => setJourneyData({ ...journey, return_station_name: value })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Covered Distance</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setJourneyData({ ...journey, coveredDistance: parseInt(value) })} />
                    </InputGroup>
                    <br />
                    <InputGroup>
                        <InputGroup.Addon>Duration</InputGroup.Addon>
                        <Input type='number' onChange={(value, event) => setJourneyData({ ...journey, duration: parseInt(value) })} />
                    </InputGroup>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setAddJourneyVisible(false)}>
                        Close
                    </CButton>
                    <CButton color="primary" onClick={handleAddJourney}>
                        Add Journey
                    </CButton>
                </CModalFooter>
            </CModal>
        </nav>
    );
};

export default NavigationBar;
