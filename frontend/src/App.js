import React from 'react';
import '@coreui/coreui/dist/css/coreui.min.css'
import 'rsuite/dist/rsuite.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserAuthContext } from "./Context";
import { useState, useEffect } from 'react';
import { fetchURL } from './fetchURL';
import './App.css';
import axios from 'axios';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Home from './components/Home';
import Journeys from './components/Journeys';
import Stations from './components/Stations';

// import Home from './Home';
// import Journeys from './Journeys';
// import Stations from './Stations';
// import Login from './Login';

function App() {

  const jwtFromStorage = window.localStorage.getItem("appAuthData");
  const initialAuthData = {
    jwt: jwtFromStorage,
    login: (newValueForJwt) => {
      const newAuthData = { ...userAuthData, jwt: newValueForJwt };
      window.localStorage.setItem("appAuthData", newValueForJwt);
      setIsLoggedIn(true);
      setUserAuthData(newAuthData);
    },
    logout: () => {
      window.localStorage.removeItem("appAuthData");
      setUserAuthData({ ...initialAuthData, jwt: null });
      setIsLoggedIn(false);
    }
  };

  const [userAuthData, setUserAuthData] = useState({ ...initialAuthData });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (userAuthData.jwt != null || userAuthData.jwt != undefined) {
      const config = {
        headers: {
          Authorization: `Bearer ${userAuthData.jwt}`,
        },
      };
      let data = null;
      axios.post(`${fetchURL}/user/verify`, data, config)
        .then((res) => {
          if (res.status === 200) {
            setIsLoggedIn(true);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            console.log("User is not logged in");
            setIsLoggedIn(false);
            userAuthData.logout();
          }
        });
    }
  });

  return (
    <BrowserRouter>
      <UserAuthContext.Provider value={userAuthData}>
        <NavigationBar />
        <div className="containerObject">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journeys" element={<Journeys />} />
            <Route path="/stations" element={<Stations />} />
          </Routes>
        </div>
        <Footer />
      </UserAuthContext.Provider>
    </BrowserRouter>
  );
};

export default App;