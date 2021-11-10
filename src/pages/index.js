import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Layout from '../components/Layout';
import Orders from './orders';
import Recent from './recent';
import Routing from './routing';
import IpoRouting from './Iporouting';
import Players from '../pages/players';
import Portfolio from '../pages/portfolio';
import Rankings from '../pages/rankings';
import Payouts from '../pages/payouts';
import Profile from './profile';
import Wallet from './wallet';
import Settings from './settings';
import Login from './login';
import Change from './change';
import Reset from './reset';
import OtpVerify from './otp-verify';
import OtpNumber from './otp-number';
import Lock from './lock';
import TermsAndConditions from './terms-and-conditions';
import NewsDetails from './news-details';
import Signup from './signup';
import Notfound from './notfound';
import Ipos from './ipos';
import PlayerStats from './playerstats';
import "bootstrap/dist/css/bootstrap.css";
import WalletBalance from '../components/WalletBalance'

export default function index() {
  return (
    <>
      <Layout>
        <Switch>
          <Route exact path="/players/:id">
            <Routing />
          </Route>
          <Route path="/ipo/:id">
            <IpoRouting />
          </Route>
          <Route path="/players">
            <Players />
          </Route>
            <Route path="/orders">
            <Orders />
          </Route>
          <Route path="/recents">
            <Recent />
          </Route>
          <Route path="/portfolio">
            <Portfolio />
          </Route>
          <Route path="/rankings">
            <Rankings />
          </Route>
          <Route path="/payouts">
            <Payouts />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/wallet">
            <Wallet />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <Route path="/reset">
            <Reset />
          </Route>
          <Route path="/change">
            <Change />
          </Route>
          <Route path="/otp-verify">
            <OtpVerify />
          </Route>
          <Route path="/otp-number">
            <OtpNumber />
          </Route>
          <Route path="/lock">
            <Lock />
          </Route>
          <Route path="/terms-and-conditions">
            <TermsAndConditions />
          </Route>
          <Route path="/news-details">
            <NewsDetails />
          </Route>
          <Route path="/notfound">
            <Notfound />
          </Route>
          <Route path="/ipos">
            <Ipos />
          </Route>
          <Route path="/playerstats">
            <PlayerStats />
          </Route>
          <Route path="/walletbalance">
            <WalletBalance />
          </Route>
          <Route >
            <Login />
          </Route>
        </Switch>
      </Layout>
    </>
  );
}

  