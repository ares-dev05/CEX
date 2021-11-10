import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
export default function ProfileSlider() {
  return (
    <>
      <div className="market-history market-order mt15">
        <Tabs defaultActiveKey="chart">
          <Tab eventKey="chart" title="Chart">
            <ul className="d-flex justify-content-between market-order-item">
    
            </ul>
          </Tab>
          <Tab eventKey="stats" title="Stats">
            <ul className="d-flex justify-content-between market-order-item">

            </ul>
          </Tab>
            <Tab eventKey="depth" title="Market Depth">
            <ul className="d-flex justify-content-between market-order-item">

            </ul>
          </Tab>
          <Tab eventKey="rewards" title="Rewards">
            <ul className="d-flex justify-content-between market-order-item">

            </ul>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
