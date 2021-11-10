import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import Web3 from 'web3'

import * as routes from "../components/constants/routes";
import { db } from "../components/firebase/firebase";
import { auth } from "../components/firebase";
import Swal from 'sweetalert2'


const SignUpPage = ({ history }) => (
  <div>
    <div className="div-flex">
      <div>
        <Signup history={history} />
      </div>
    </div>
  </div>
);
const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  showingAlert: false
};

//A Higher order function with prop name as key and the value to be assigned to
const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});

class Signup extends Component {
  //defining state
  state = {
    ...INITIAL_STATE
  };

  // onChange = (propName, value) => {
  //   this.setState({
  //     [propName]: value
  //   });
  // };

  onSubmit = (event) => {
    event.preventDefault();

    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    var account1 = web3.eth.accounts.create();
    const { username, email, passwordOne } = this.state;
    const { history } = this.props;
    auth
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      //it the above functions resolves, reset the state to its initial state values, otherwise, set the error object
      .then(authUser => {
        db.collection('users').doc(authUser.user.uid).set({
          uid: authUser.user.uid,
          Firstname: username,
          email: email,
          passwordOne: passwordOne,
          address: account1.address,
          privateKey: account1.privateKey,
        })
          // sending alert if it success
          .then(() => {
            console.log('Thank you for Subscribing Mailing list');
          })
          // sending the error if it fails.
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error...',
              text: error.message,
              
            })
          });
      });
    history.push(routes.SIGN_IN);
  };

  timer = () => {
    this.setState({
      showingAlert: true
    });

    setTimeout(() => {
      this.setState({
        showingAlert: false
      });
    }, 4000);
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
      showingAlert
    } = this.state;
    //a boolen to perform validation
    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "";

    return (
      <div>
        {showingAlert && (
          <Alert color="danger" onLoad={this.timer}>
            {error.message}
          </Alert>
        )}
        <div className="vh-100 d-flex justify-content-center">
          <div className="form-access my-auto">
            <form onSubmit={this.onSubmit}>
              <span>Create Account</span>
              <div className="form-group">
                <input
                  type="username"
                  name="username"
                  id="userName"
                  className="form-control"
                  placeholder="Full Name"
                  value={username}
                  onChange={e =>
                    this.setState(byPropKey("username", e.target.value))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  id="exampleEmail"
                  className="form-control"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => this.setState(byPropKey("email", e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  id="examplePassword1"
                  className="form-control"
                  placeholder="Password"
                  value={passwordOne}
                  onChange={e =>
                    this.setState(byPropKey("passwordOne", e.target.value))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  id="examplePassword2"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={passwordTwo}
                  onChange={e =>
                    this.setState(byPropKey("passwordTwo", e.target.value))
                  }
                  required
                />
              </div>
              <div className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="form-checkbox"
                  required
                />
                <label className="custom-control-label" htmlFor="form-checkbox">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions">Terms & Conditions</Link>
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Create Account
              </button>
            </form>
            <h2>
              Already have an account?
              <Link to="/login"> Sign in here</Link>
            </h2>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(SignUpPage); //using a HoC to get access to history
export { Signup };