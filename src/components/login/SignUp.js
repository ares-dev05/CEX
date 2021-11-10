import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import Web3 from 'web3'

import * as routes from "../constants/routes";
import { db } from "../firebase/firebase";
import { auth } from "../firebase";
import Swal from 'sweetalert2'

const SignUpPage = ({ history }) => (
  <div>
    <div className="div-flex">
      <div>
        <h1 className="centered">Sign Up</h1>
        <SignUpForm history={history} />
      </div>
    </div>
  </div>
);

//################### Sign Up Form ###################
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

class SignUpForm extends Component {
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
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <Label for="userName">Full Name</Label>
            <Input
              type="username"
              name="username"
              id="userName"
              placeholder="John Doe"
              value={username}
              onChange={e =>
                this.setState(byPropKey("username", e.target.value))
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="exampleEmail">Email</Label>
            <Input
              type="email"
              name="email"
              id="exampleEmail"
              placeholder="user@gmail.com"
              value={email}
              onChange={e => this.setState(byPropKey("email", e.target.value))}
            />
          </FormGroup>
          <FormGroup>
            <Label for="examplePassword1">Password</Label>
            <Input
              type="password"
              name="password"
              id="examplePassword1"
              placeholder="Password"
              value={passwordOne}
              onChange={e =>
                this.setState(byPropKey("passwordOne", e.target.value))
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="examplePassword2">Confirm Password</Label>
            <Input
              type="password"
              name="password"
              id="examplePassword2"
              placeholder="Confirm Password"
              value={passwordTwo}
              onChange={e =>
                this.setState(byPropKey("passwordTwo", e.target.value))
              }
            />
          </FormGroup>

          <div className="text-center">
            <Button disabled={isInvalid} type="submit">
              Sign Up
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

//################### Sign Up Link ###################
//used in the sign in when the user don't have an account registered yet
const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={routes.SIGN_UP}>Sign Up</Link>
  </p>
);

//exports
export default withRouter(SignUpPage); //using a HoC to get access to history
export { SignUpForm, SignUpLink };

 