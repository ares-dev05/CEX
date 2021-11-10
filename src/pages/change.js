import { Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { auth, db } from "../components/firebase";
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as routes from "../components/constants/routes";
import { withRouter } from "react-router-dom";
import Swal from 'sweetalert2'


const ResetPage = ({ history }) => (
  <div>
    <div className="div-flex">
      <div>
        <Change history={history} />
      </div>
    </div>
  </div>
);
const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value
});
const INITIAL_STATE = {
  passwordOld: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  showingAlert: false
};
class Change extends Component {
  state = { ...INITIAL_STATE };
  onSubmit = event => {
    event.preventDefault();
    const { passwordOld, passwordOne, passwordTwo } = this.state;
    const { history } = this.props;
    auth
    .doPasswordChange( passwordOne)
    .then((res) => {
      this.setState({ ...INITIAL_STATE });
      console.log("this is rest data=======>",res)
      history.push(routes.HOME);
      Swal.fire({
        icon : 'success',
        title : 'Change Success',
        text : 'Change Password Success',
      });
    })
    .catch(error => {
      Swal.fire({
        icon : 'error',
        title : 'Error',
        text : error,
      });
      this.setState(byPropKey("error", error));
      this.timer(); //defined below
    });
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
      passwordOld,
      passwordOne,
      passwordTwo,
      error,
      showingAlert
    } = this.state;
    //a boolen to perform validation
    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      passwordOld === "" ;
    return (
      <>
      {showingAlert && (
          <Alert color="danger" onLoad={this.timer}>
            {error.message}
          </Alert>
        )}
        <div className="vh-100 d-flex justify-content-center">
          <div className="form-access my-auto">
            <form onSubmit={this.onSubmit}>
              <span>Change password</span>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="examplePassword"
                  placeholder="Old Password"
                  value={passwordOld}
                  onChange={event =>
                    this.setState(byPropKey("passwordOld", event.target.value))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="examplePassword"
                  placeholder="New Password"
                  value={passwordOne}
                  onChange={event =>
                    this.setState(byPropKey("passwordOne", event.target.value))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  id="examplePassword"
                  placeholder="Confirm Password"
                  value={passwordTwo}
                  onChange={event =>
                    this.setState(byPropKey("passwordTwo", event.target.value))
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Change
              </button>
              <h2>
                Remember Password?
                <Link to="/login"> Sign in here</Link>
              </h2>
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(ResetPage); //using a HoC to get access to history
export { Change };