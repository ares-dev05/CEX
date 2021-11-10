import React from 'react';
import { Link } from 'react-router-dom';


export default function MarketNews() {
  return (
    <>
      <div className="market-news mt15">
        <h2 className="heading">About Player</h2>
        <ul>
          <li>
            <Link to="/news-details">
              <h2>Erling Haaland</h2>
              To accelerate the ecosystem construction of KuCoin Share (KCS) and
              promote the implementation of the KCS application.
              <span>2019-12-04 20:22</span>
            </Link>
          </li>
          <li>
            <Link to="/news-details">
              <strong>KCS Pay Fees Feature is Coming Soon</strong>
              To accelerate the ecosystem construction of KuCoin Share (KCS) and
              promote the implementation of the KCS application.
              <span>2019-12-04 20:22</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
