import React from "react";
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";

import SignOutButton from "./SignOut";
import * as routes from "../constants/routes";

import AuthUserContext from "./AuthUserContext";

const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? <NavigationAuth userInfo={authUser} /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
);

const NavigationNonAuth = () => (
  <Navbar color="light" light expand="md">
    <NavbarBrand>
      <Link to={routes.LANDING}> Landing </Link>
    </NavbarBrand>
    <Nav className="ml-auto" navbar>
      <NavItem>
        <NavLink>
          <Link to={routes.SIGN_IN}>Sign In</Link>
        </NavLink>
      </NavItem>
    </Nav>
  </Navbar>
);

export default Navigation;

const NavigationAuth = ({ userInfo }) => (
  <Navbar color="light" light expand="md">
    <NavbarBrand>
      <Link to={routes.LANDING}>DApp Token Exchange</Link>
    </NavbarBrand>
    <Nav className="ml-auto" navbar>
      <NavItem>
        <NavLink>
          <Link to={routes.HAALAND}>haaland</Link>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink>
          <Link to={routes.HOME}>mbappe</Link>
        </NavLink>
      </NavItem>
      {userInfo.providerData[0].providerId === "facebook.com" ? null : (
        <NavItem>
          <NavLink>
            {/* <Link to={routes.ACCOUNT}>Account</Link> */}
          </NavLink>
        </NavItem>
      )}
      <NavItem>
        <SignOutButton />
      </NavItem>
    </Nav>
  </Navbar>
);

