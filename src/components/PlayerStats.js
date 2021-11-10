import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import AboutPlayer from '../components/AboutPlayer';

export default function PlayerStats() {
  return (
    <>

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <AboutPlayer />
          </div>
        </div>
      </div>

    </>
     

  );
}
