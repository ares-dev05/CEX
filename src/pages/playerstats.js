import React from 'react';
import PlayerStats from '../components/PlayerStats';
import PlayerStats2 from '../components/PlayerStats2';
import ProfileSlider from '../components/ProfileSlider';

export default function Stats() {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
                <PlayerStats />
          </div>
                    <div className="col-md-6">
                <PlayerStats2 />
                </div>
        </div>
      </div>
      <ProfileSlider />
      
    </>
  );
}
