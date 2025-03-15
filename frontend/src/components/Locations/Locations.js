import React from 'react';
import Map from '../Map/Map';
import './Locations.css';

function LocationPage() {
  return (
    <div className='locations__page'>
      <h1 className='locations__title'>Find a Store</h1>
      {/* <Map /> */}
      {/* Add other location-related content here */}
      <p className='locations_coming-soon'>Locations coming soon</p>
    </div>
  );
}

export default LocationPage;
