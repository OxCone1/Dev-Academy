import React from 'react'
import { NavLink } from 'react-router-dom'
import bikeStation from '../assets/bikestation.jpg'
import bikeJourney from '../assets/journey.jpg'


export default function Home() {
    return (
        <div className='divider'>
            <div className='stations'>
                <div className='image-wrapper'>
                    <img src={bikeStation} alt='Bike Station' />
                </div>
                <div className='content-wrapper'>
                    <h1>Bike Stations</h1>
                    <NavLink to='/stations' className='button'>View Stations</NavLink>
                </div>
            </div>
            <div className='journeys'>
                <div className='image-wrapper'>
                    <img src={bikeJourney} alt='Bike Journey' />
                </div>
                <div className='content-wrapper'>
                    <h1>Bike Journeys</h1>
                    <NavLink to='/journeys' className='button'>View Journeys</NavLink>
                </div>
            </div>
        </div>
    );
}
