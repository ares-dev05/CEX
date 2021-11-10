import React from 'react';
import PortfolioList from '../components/PortfolioList';
import PortfolioStats from '../components/PortfolioStats';

export default function Portfolio() {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
                <PortfolioStats />
          </div>
        </div>
      </div>
      <PortfolioList />
    </>
  );
}
