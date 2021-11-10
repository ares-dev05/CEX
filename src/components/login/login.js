import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { Container } from "reactstrap";
import "./login.css";

import { firebase } from "../firebase";
import * as routes from "../constants/routes";

//nav stuff
import Navigation from "./Navigation";
import LandingPage from "./Landing";
import SignUpPage from "./SignUp";
import SignInPage from "./SignIn";
import App from "../App";
import withAuthentication from "./withAuthentication";

const login = () => (
  <BrowserRouter>
    <Container>
      <Navigation />
      <Route exact path={routes.LANDING} component={LandingPage} />
      <Route exact path={routes.SIGN_UP} component={SignUpPage} />
      <Route exact path={routes.SIGN_IN} component={SignInPage} />
      <Route exact path={routes.HOME} component={App} />
      <Route exact path={routes.HAALAND} component={App} />
    </Container>
  </BrowserRouter>
);


export default withAuthentication(login); //using HoC to handle session
