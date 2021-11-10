import React from 'react';
import PlayersCarousel from '../components/PlayersCarousel';
import PlayersList from '../components/PlayersList';

export default function Players() {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <PlayersCarousel />
          </div>
        </div>
      </div>
      <PlayersList />
    </>
  );
}
